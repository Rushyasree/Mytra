import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";
import { NextResponse } from "next/server";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const bookings = await prisma.booking.findMany({
      include: {
        traveler: { select: { name: true, email: true } },
        guide: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
