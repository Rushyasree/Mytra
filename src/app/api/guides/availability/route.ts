import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDurationHours, normalizeDateOnly, timeRangesOverlap } from "@/lib/booking";
import { checkRateLimit, requireSession } from "@/lib/security";
import { safeString } from "@/lib/validation";

export async function POST(req: Request) {
  const rateLimited = checkRateLimit(req, "guide-availability-create", 20, 60_000);
  if (rateLimited) return rateLimited;

  const { response, user } = await requireSession();
  if (response) return response;

  if (user.role !== "GUIDE") {
    return NextResponse.json({ error: "Only guides can manage availability." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const date = normalizeDateOnly(safeString(body.date));
    const startTime = safeString(body.startTime);
    const endTime = safeString(body.endTime);

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: "Date, start time, and end time are required." }, { status: 400 });
    }

    if (getDurationHours(startTime, endTime) === null) {
      return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
    }

    const guideProfile = await prisma.guideProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!guideProfile) {
      return NextResponse.json({ error: "Complete your guide profile before adding availability." }, { status: 400 });
    }

    const existingSlots = await prisma.availability.findMany({
      where: { guideId: guideProfile.id, date },
    });

    const hasOverlap = existingSlots.some((slot) =>
      timeRangesOverlap(startTime, endTime, slot.startTime, slot.endTime)
    );

    if (hasOverlap) {
      return NextResponse.json({ error: "This availability overlaps an existing slot." }, { status: 409 });
    }

    const availability = await prisma.availability.create({
      data: {
        guideId: guideProfile.id,
        date,
        startTime,
        endTime,
      },
    });

    return NextResponse.json({ availability }, { status: 201 });
  } catch (error) {
    console.error("Availability create error:", error);
    return NextResponse.json({ error: "Could not create availability." }, { status: 500 });
  }
}
