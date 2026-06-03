import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit, requireBookingAccess } from "@/lib/security";

export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, "location", 30, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { bookingId, lat, lng } = await request.json();
    if (!bookingId || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Booking ID, lat, and lng are required" }, { status: 400 });
    }

    const access = await requireBookingAccess(bookingId);
    if (access.response) return access.response;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { lat, lng }
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}
