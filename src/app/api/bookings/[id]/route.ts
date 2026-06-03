import prisma from "@/lib/prisma";
import {
  checkRateLimit,
  requireBookingAccess,
  validateBookingStatusTransition,
} from "@/lib/security";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(req, "booking-status", 20, 60_000);
  if (rateLimited) return rateLimited;

  const { id } = await params;
  const { status } = await req.json();

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  try {
    const access = await requireBookingAccess(id);
    if (access.response) return access.response;
    const { booking, user } = access;
    if (!booking || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transitionError = validateBookingStatusTransition(booking.status, status);
    if (transitionError) {
      return NextResponse.json({ error: transitionError }, { status: 400 });
    }

    const isTraveler = user.id === booking.travelerId;
    const isGuide = user.id === booking.guideId;
    const isAdmin = user.role === "ADMIN";

    if (status === "CONFIRMED" && !isGuide && !isAdmin) {
      return NextResponse.json({ error: "Only the assigned guide can accept this booking." }, { status: 403 });
    }

    if (status === "CANCELLED" && booking.status === "PENDING" && !isTraveler && !isGuide && !isAdmin) {
      return NextResponse.json({ error: "Only the traveler, guide, or admin can cancel this request." }, { status: 403 });
    }

    if (status === "CANCELLED" && booking.status === "CONFIRMED" && !isTraveler && !isAdmin) {
      return NextResponse.json({ error: "Only the traveler or admin can cancel confirmed bookings." }, { status: 403 });
    }

    if (status === "COMPLETED" && !isGuide && !isAdmin) {
      return NextResponse.json({ error: "Only the guide or admin can mark a booking completed." }, { status: 403 });
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status },
      });

      if (status === "CANCELLED" && booking.availabilityId) {
        await tx.availability.update({
          where: { id: booking.availabilityId },
          data: { isBooked: false },
        });
      }

      return updated;
    });

    // Notify the other party
    const notifyId = user.id === booking.travelerId ? booking.guideId : booking.travelerId;
    const actor = isGuide ? "Guide" : isTraveler ? "Traveler" : "Admin";
    const statusCopy =
      status === "CONFIRMED"
        ? "accepted"
        : status === "CANCELLED"
          ? "cancelled"
          : status === "COMPLETED"
            ? "completed"
            : status.toLowerCase();

    await prisma.notification.create({
      data: {
        userId: notifyId,
        title: `Booking ${statusCopy}`,
        message: `${actor} ${statusCopy} your booking.`,
        type: "BOOKING",
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
