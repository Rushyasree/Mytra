import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";
import { NextResponse } from "next/server";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

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
