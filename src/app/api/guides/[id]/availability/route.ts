import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const guide = await prisma.guideProfile.findFirst({
      where: {
        id,
        status: "APPROVED",
        isVerified: true,
        pricePerHour: { gt: 0 },
      },
      select: { id: true },
    });

    if (!guide) {
      return NextResponse.json({ error: "Guide not available for booking." }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availability = await prisma.availability.findMany({
      where: {
        guideId: id,
        isBooked: false,
        date: { gte: today },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Availability fetch error:", error);
    return NextResponse.json({ error: "Could not fetch availability." }, { status: 500 });
  }
}
