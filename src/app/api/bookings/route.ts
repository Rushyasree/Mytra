import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Fetch bookings for the logged-in user (traveler or guide)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const role = (session.user as any).role;

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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { guideId, date, duration, totalPrice, experienceId } = await req.json();

    if (!guideId || !date || !duration || !totalPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Basic double booking check (simple date match)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        guideId,
        date: new Date(date),
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking) {
      return NextResponse.json({ error: "Guide is already booked for this time." }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        travelerId: session.user.id,
        guideId,
        date: new Date(date),
        duration: parseInt(duration),
        totalPrice: parseFloat(totalPrice),
        status: "PENDING",
      },
    });

    // Create notification for guide
    await prisma.notification.create({
      data: {
        userId: guideId,
        title: "New Booking Request",
        message: `You have a new booking request for ${new Date(date).toLocaleDateString()}.`,
        type: "BOOKING",
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
