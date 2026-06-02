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
      data: { lat, lng }
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}
