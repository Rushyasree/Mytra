import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkRateLimit,
  requireAdmin,
  requireBookingAccess,
} from "@/lib/security";

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, "sos", 5, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { bookingId, lat, lng } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const access = await requireBookingAccess(bookingId);
    if (access.response) return access.response;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        sosTriggered: true,
        sosTimestamp: new Date(),
        lat,
        lng
      },
      include: { traveler: true, guide: true }
    });

    // Create system notification for guide
    await prisma.notification.create({
      data: {
        userId: booking.guideId,
        title: "🆘 EMERGENCY: SOS TRIGGERED",
        message: `${booking.traveler.name} has triggered an SOS! Check trip status immediately.`,
        type: "SYSTEM"
      }
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to trigger SOS" }, { status: 500 });
  }
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const alerts = await prisma.booking.findMany({
      where: { sosTriggered: true },
      include: { traveler: true, guide: true },
      orderBy: { sosTimestamp: "desc" }
    });
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
