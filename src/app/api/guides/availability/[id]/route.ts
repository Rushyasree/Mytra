import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDurationHours, normalizeDateOnly, timeRangesOverlap } from "@/lib/booking";
import { checkRateLimit, requireSession } from "@/lib/security";
import { safeString } from "@/lib/validation";

async function requireAvailabilityOwner(id: string) {
  const { response, user } = await requireSession();
  if (response) return { response, user: null, availability: null };

  const availability = await prisma.availability.findUnique({
    where: { id },
    include: { guide: { select: { userId: true, id: true } } },
  });

  if (!availability) {
    return {
      response: NextResponse.json({ error: "Availability slot not found." }, { status: 404 }),
      user,
      availability: null,
    };
  }

  if (availability.guide.userId !== user.id && user.role !== "ADMIN") {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      user,
      availability,
    };
  }

  return { response: null, user, availability };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(req, "guide-availability-update", 30, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { id } = await params;
    const access = await requireAvailabilityOwner(id);
    if (access.response) return access.response;
    if (!access.availability) {
      return NextResponse.json({ error: "Availability slot not found." }, { status: 404 });
    }

    if (access.availability.isBooked) {
      return NextResponse.json({ error: "Booked slots cannot be edited." }, { status: 409 });
    }

    const body = await req.json();
    const date = normalizeDateOnly(safeString(body.date)) ?? access.availability.date;
    const startTime = safeString(body.startTime) || access.availability.startTime;
    const endTime = safeString(body.endTime) || access.availability.endTime;

    if (getDurationHours(startTime, endTime) === null) {
      return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
    }

    const existingSlots = await prisma.availability.findMany({
      where: {
        guideId: access.availability.guideId,
        date,
        id: { not: id },
      },
    });

    const hasOverlap = existingSlots.some((slot) =>
      timeRangesOverlap(startTime, endTime, slot.startTime, slot.endTime)
    );

    if (hasOverlap) {
      return NextResponse.json({ error: "This availability overlaps an existing slot." }, { status: 409 });
    }

    const availability = await prisma.availability.update({
      where: { id },
      data: { date, startTime, endTime },
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Availability update error:", error);
    return NextResponse.json({ error: "Could not update availability." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = checkRateLimit(req, "guide-availability-delete", 30, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { id } = await params;
    const access = await requireAvailabilityOwner(id);
    if (access.response) return access.response;
    if (!access.availability) {
      return NextResponse.json({ error: "Availability slot not found." }, { status: 404 });
    }

    if (access.availability.isBooked) {
      return NextResponse.json({ error: "Booked slots cannot be deleted." }, { status: 409 });
    }

    await prisma.availability.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Availability delete error:", error);
    return NextResponse.json({ error: "Could not delete availability." }, { status: 500 });
  }
}
