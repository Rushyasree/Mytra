import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const guides = await prisma.guideProfile.findMany({
      include: {
        user: { select: { name: true, email: true, image: true } },
        city: true,
      },
      orderBy: { status: "asc" }, // Show PENDING first
    });

    return NextResponse.json(guides);
  } catch (error) {
    console.error("Error fetching admin guides:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
