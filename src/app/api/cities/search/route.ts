import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const cities = await prisma.city.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { state: { contains: query } },
        ],
      },
      take: 8,
      select: {
        id: true,
        name: true,
        state: true,
        slug: true,
        category: true,
      }
    });

    return NextResponse.json(cities);
  } catch (error) {
    console.error("City Search Error:", error);
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}
