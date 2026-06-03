import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getDurationHours, normalizeDateOnly, timeRangesOverlap } from "@/lib/booking";
import { checkRateLimit } from "@/lib/security";
import { safeString } from "@/lib/validation";
import { NextResponse } from "next/server";

// Fetch bookings for the logged-in user (traveler or guide)
export async function GET(req: Request) {
  const rateLimited = checkRateLimit(req, "bookings-read", 60, 60_000);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const role = (session.user as { role?: string }).role;

  try {
    const bookings = await prisma.booking.findMany({
      where: role === "GUIDE" ? { guideId: userId } : { travelerId: userId },
      include: {
        traveler: { select: { name: true, image: true, email: true } },
        guide: { select: { name: true, image: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new booking
export async function POST(req: Request) {
  const rateLimited = checkRateLimit(req, "bookings-create", 10, 60_000);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const travelerId = session.user.id;

  try {
    const body = await req.json();
    const guideProfileId = safeString(body.guideProfileId);
    const experienceId = safeString(body.experienceId);
    const cityId = safeString(body.cityId);
    const availabilityId = safeString(body.availabilityId);
    const date = normalizeDateOnly(safeString(body.date));
    const startTime = safeString(body.startTime);
    const endTime = safeString(body.endTime);
    const notes = safeString(body.notes);
    const travelersCount = Number(body.travelersCount || 1);

    if (!guideProfileId || !cityId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "Guide, city, date, start time, and end time are required." }, { status: 400 });
    }

    if ((session.user as { role?: string }).role === "GUIDE") {
      return NextResponse.json({ error: "Guide accounts cannot create traveler bookings." }, { status: 403 });
    }

    if (!Number.isInteger(travelersCount) || travelersCount < 1 || travelersCount > 10) {
      return NextResponse.json({ error: "Travelers count must be between 1 and 10." }, { status: 400 });
    }

    const duration = getDurationHours(startTime, endTime);
    if (duration === null) {
      return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
    }

    const guideProfile = await prisma.guideProfile.findFirst({
      where: {
        id: guideProfileId,
        status: "APPROVED",
        isVerified: true,
        pricePerHour: { gt: 0 },
      },
      include: { user: true, city: true },
    });

    if (!guideProfile || !guideProfile.cityId) {
      return NextResponse.json({ error: "Guide is not available for booking." }, { status: 404 });
    }

    if (guideProfile.userId === travelerId) {
      return NextResponse.json({ error: "You cannot book your own guide profile." }, { status: 400 });
    }

    if (guideProfile.cityId !== cityId) {
      return NextResponse.json({ error: "Guide does not belong to the selected city." }, { status: 400 });
    }

    const experience = experienceId
      ? await prisma.experience.findFirst({
          where: { id: experienceId, cityId },
          select: { id: true, price: true, title: true },
        })
      : null;

    if (experienceId && !experience) {
      return NextResponse.json({ error: "Experience is not available in this city." }, { status: 404 });
    }

    const availability = availabilityId
      ? await prisma.availability.findFirst({
          where: {
            id: availabilityId,
            guideId: guideProfileId,
            date,
            isBooked: false,
          },
        })
      : await prisma.availability.findFirst({
          where: {
            guideId: guideProfileId,
            date,
            startTime,
            endTime,
            isBooked: false,
          },
        });

    if (!availability) {
      return NextResponse.json({ error: "Selected slot is no longer available." }, { status: 409 });
    }

    if (availability.startTime !== startTime || availability.endTime !== endTime) {
      return NextResponse.json({ error: "Selected time does not match the availability slot." }, { status: 400 });
    }

    const candidateBookings = await prisma.booking.findMany({
      where: {
        guideProfileId,
        date,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    const hasOverlappingBooking = candidateBookings.some((booking) =>
      booking.startTime && booking.endTime
        ? timeRangesOverlap(startTime, endTime, booking.startTime, booking.endTime)
        : false
    );

    if (hasOverlappingBooking) {
      return NextResponse.json({ error: "Guide already has a booking request for this slot." }, { status: 409 });
    }

    const baseAmount = guideProfile.pricePerHour * duration;
    const experienceAmount = experience?.price ?? 0;
    const totalAmount = (baseAmount + experienceAmount) * travelersCount;

    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          travelerId,
          guideId: guideProfile.userId,
          guideProfileId,
          experienceId: experience?.id,
          cityId,
          availabilityId: availability.id,
          date,
          startTime,
          endTime,
          duration,
          travelersCount,
          notes,
          totalPrice: totalAmount,
          currency: "INR",
          status: "PENDING",
          payments: {
            create: {
              amount: totalAmount,
              currency: "INR",
              provider: "PENDING_PROVIDER",
              status: "INITIATED",
            },
          },
        },
        include: {
          guide: { select: { name: true, email: true } },
          traveler: { select: { name: true, email: true } },
          payments: true,
        },
      });

      await tx.availability.update({
        where: { id: availability.id },
        data: { isBooked: true },
      });

      await tx.notification.create({
        data: {
          userId: guideProfile.userId,
          title: "New Booking Request",
          message: `${createdBooking.traveler.name || "A traveler"} requested ${duration} hours on ${date.toLocaleDateString()}.`,
          type: "BOOKING",
        },
      });

      return createdBooking;
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
