import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";
import { NextResponse } from "next/server";

type FraudAlert = {
  id: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  signal: string;
  message: string;
  entityId: string;
  entityType: "USER" | "GUIDE" | "BOOKING";
  metadata?: Record<string, string | number | boolean | null>;
};

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function addAlert(alerts: FraudAlert[], alert: FraudAlert) {
  alerts.push(alert);
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const now = new Date();
    const oneHourAgo = hoursAgo(1);
    const twentyFourHoursAgo = hoursAgo(24);
    const sevenDaysAgo = hoursAgo(24 * 7);
    const alerts: FraudAlert[] = [];

    const [flaggedUsers, flaggedGuides, guides, recentBookings, sosBookings] = await Promise.all([
      prisma.user.findMany({
        where: { isFlagged: true },
        select: { id: true, name: true, email: true, flagReason: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.guideProfile.findMany({
        where: { isFlagged: true },
        include: { user: { select: { name: true, email: true } }, city: true },
        orderBy: { id: "asc" },
      }),
      prisma.guideProfile.findMany({
        where: { pricePerHour: { gt: 0 } },
        include: { user: { select: { name: true, email: true } }, city: true },
      }),
      prisma.booking.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        include: {
          traveler: { select: { id: true, name: true, email: true } },
          guide: { select: { id: true, name: true, email: true } },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.findMany({
        where: { sosTriggered: true },
        include: {
          traveler: { select: { id: true, name: true, email: true } },
          guide: { select: { id: true, name: true, email: true } },
        },
        orderBy: { sosTimestamp: "desc" },
        take: 20,
      }),
    ]);

    const guideProfilesById = new Map(guides.map((guide) => [guide.id, guide]));
    const experienceIds = Array.from(
      new Set(recentBookings.map((booking) => booking.experienceId).filter(Boolean) as string[])
    );
    const experiences = experienceIds.length
      ? await prisma.experience.findMany({ where: { id: { in: experienceIds } } })
      : [];
    const experiencesById = new Map(experiences.map((experience) => [experience.id, experience]));

    const pricesByCity = new Map<string, number[]>();
    for (const guide of guides) {
      const key = guide.city?.name || "Unassigned";
      pricesByCity.set(key, [...(pricesByCity.get(key) || []), guide.pricePerHour]);
    }

    for (const guide of guides) {
      const cityName = guide.city?.name || "Unassigned";
      const cityAverage = average(pricesByCity.get(cityName) || []);
      const threshold = Math.max(5000, cityAverage > 0 ? cityAverage * 2.5 : 5000);

      if (guide.pricePerHour > threshold) {
        addAlert(alerts, {
          id: `guide-price-${guide.id}`,
          severity: guide.pricePerHour > threshold * 1.5 ? "HIGH" : "MEDIUM",
          signal: "Guide pricing outlier",
          message: `${guide.user.name || "Guide"} is charging ₹${guide.pricePerHour}/hr in ${cityName}, above the local threshold of ₹${Math.round(threshold)}/hr.`,
          entityId: guide.id,
          entityType: "GUIDE",
          metadata: {
            pricePerHour: guide.pricePerHour,
            cityAverage: Math.round(cityAverage),
            threshold: Math.round(threshold),
          },
        });
      }
    }

    const bookingsByTraveler = new Map<string, typeof recentBookings>();
    for (const booking of recentBookings) {
      bookingsByTraveler.set(booking.travelerId, [...(bookingsByTraveler.get(booking.travelerId) || []), booking]);
    }

    for (const [travelerId, travelerBookings] of bookingsByTraveler) {
      const traveler = travelerBookings[0]?.traveler;
      const bookingsLastHour = travelerBookings.filter((booking) => booking.createdAt >= oneHourAgo);
      const bookingsLastDay = travelerBookings.filter((booking) => booking.createdAt >= twentyFourHoursAgo);
      const cancelled = travelerBookings.filter((booking) => booking.status === "CANCELLED");

      if (bookingsLastHour.length >= 3 || bookingsLastDay.length >= 5) {
        addAlert(alerts, {
          id: `booking-burst-${travelerId}`,
          severity: bookingsLastHour.length >= 3 ? "HIGH" : "MEDIUM",
          signal: "Booking velocity spike",
          message: `${traveler?.name || "Traveler"} created ${bookingsLastHour.length || bookingsLastDay.length} bookings in a short window.`,
          entityId: travelerId,
          entityType: "USER",
          metadata: {
            bookingsLastHour: bookingsLastHour.length,
            bookingsLastDay: bookingsLastDay.length,
          },
        });
      }

      if (travelerBookings.length >= 4 && cancelled.length / travelerBookings.length >= 0.6) {
        addAlert(alerts, {
          id: `cancellation-pattern-${travelerId}`,
          severity: "MEDIUM",
          signal: "High cancellation ratio",
          message: `${traveler?.name || "Traveler"} has cancelled ${cancelled.length} of ${travelerBookings.length} recent bookings.`,
          entityId: travelerId,
          entityType: "USER",
          metadata: {
            recentBookings: travelerBookings.length,
            cancelledBookings: cancelled.length,
            cancellationRate: Number((cancelled.length / travelerBookings.length).toFixed(2)),
          },
        });
      }
    }

    for (const booking of recentBookings) {
      const guideProfile = booking.guideProfileId ? guideProfilesById.get(booking.guideProfileId) : null;
      if (!guideProfile) continue;

      const experience = booking.experienceId ? experiencesById.get(booking.experienceId) : null;
      const expectedTotal =
        (guideProfile.pricePerHour * booking.duration + (experience?.price || 0)) * booking.travelersCount;
      const difference = Math.abs(booking.totalPrice - expectedTotal);
      const allowedDifference = Math.max(250, expectedTotal * 0.1);

      if (expectedTotal > 0 && difference > allowedDifference) {
        addAlert(alerts, {
          id: `pricing-integrity-${booking.id}`,
          severity: difference > expectedTotal * 0.4 ? "HIGH" : "MEDIUM",
          signal: "Booking price mismatch",
          message: `Booking ${booking.id.slice(0, 8)} total is ₹${booking.totalPrice}, expected around ₹${Math.round(expectedTotal)} from guide and experience pricing.`,
          entityId: booking.id,
          entityType: "BOOKING",
          metadata: {
            totalPrice: booking.totalPrice,
            expectedTotal: Math.round(expectedTotal),
            difference: Math.round(difference),
          },
        });
      }

      const paidAmount = booking.payments
        .filter((payment) => payment.status === "PAID")
        .reduce((sum, payment) => sum + payment.amount, 0);

      if (paidAmount > 0 && Math.abs(paidAmount - booking.totalPrice) > Math.max(250, booking.totalPrice * 0.1)) {
        addAlert(alerts, {
          id: `payment-total-${booking.id}`,
          severity: "HIGH",
          signal: "Payment total mismatch",
          message: `Paid amount for booking ${booking.id.slice(0, 8)} does not match the booking total.`,
          entityId: booking.id,
          entityType: "BOOKING",
          metadata: {
            paidAmount,
            totalPrice: booking.totalPrice,
          },
        });
      }
    }

    for (const booking of sosBookings) {
      addAlert(alerts, {
        id: `sos-${booking.id}`,
        severity: "HIGH",
        signal: "SOS incident",
        message: `${booking.traveler.name || "Traveler"} triggered SOS on booking ${booking.id.slice(0, 8)}${booking.lat && booking.lng ? " with shared location" : ""}.`,
        entityId: booking.id,
        entityType: "BOOKING",
        metadata: {
          sosTimestamp: booking.sosTimestamp?.toISOString() || null,
          hasLocation: Boolean(booking.lat && booking.lng),
          status: booking.status,
        },
      });
    }

    alerts.sort((a, b) => {
      const severityRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return severityRank[b.severity] - severityRank[a.severity];
    });

    return NextResponse.json({
      generatedAt: now.toISOString(),
      summary: {
        totalAlerts: alerts.length,
        high: alerts.filter((alert) => alert.severity === "HIGH").length,
        medium: alerts.filter((alert) => alert.severity === "MEDIUM").length,
        low: alerts.filter((alert) => alert.severity === "LOW").length,
        flaggedUsers: flaggedUsers.length,
        flaggedGuides: flaggedGuides.length,
      },
      flaggedUsers,
      flaggedGuides,
      alerts,
    });
  } catch (error) {
    console.error("Fraud API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { targetId, targetType, isFlagged, flagReason } = await req.json();

    if (!targetId || !["USER", "GUIDE"].includes(targetType)) {
      return NextResponse.json({ error: "Invalid flag target" }, { status: 400 });
    }

    if (targetType === "USER") {
      await prisma.user.update({
        where: { id: targetId },
        data: { isFlagged: Boolean(isFlagged), flagReason: flagReason || null },
      });
    } else {
      await prisma.guideProfile.update({
        where: { id: targetId },
        data: { isFlagged: Boolean(isFlagged), flagReason: flagReason || null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fraud flag update failed:", error);
    return NextResponse.json({ error: "Failed to update flag status" }, { status: 500 });
  }
}
