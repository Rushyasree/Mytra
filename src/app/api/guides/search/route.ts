import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const minPrice = parseFloat(searchParams.get("minPrice") || "0");
  const maxPrice = parseFloat(searchParams.get("maxPrice") || "10000");
  const rating = parseFloat(searchParams.get("rating") || "0");
  const gender = searchParams.get("gender") || "";
  const interests = searchParams.get("interests") ? searchParams.get("interests")?.split(",") : [];
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 9;
  const skip = (page - 1) * limit;

  const where: any = {
    status: "APPROVED",
    pricePerHour: { gte: minPrice, lte: maxPrice },
    rating: { gte: rating },
  };

  if (q) {
    where.OR = [
      { user: { name: { contains: q } } },
      { university: { contains: q } }
    ];
  }

  if (city) {
    where.city = { name: { contains: city } };
  }

  if (gender && gender !== "all") {
    where.gender = gender;
  }

  if (interests && interests.length > 0) {
    where.interests = {
      contains: interests[0], // Simplified for now
    };
  }

  try {
    const guides = await prisma.guideProfile.findMany({
      where,
      include: { user: true, city: true },
      orderBy: { rating: "desc" },
      take: limit,
      skip: skip,
    });

    const total = await prisma.guideProfile.count({ where });

    return NextResponse.json({
      guides,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch guides" }, { status: 500 });
  }
}
