import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { bookingId, lat, lng } = await request.json();

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
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
