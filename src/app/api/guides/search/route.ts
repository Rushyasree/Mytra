import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parsePreferenceList, scoreGuideRecommendation } from "@/lib/recommendations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const minPrice = parseFloat(searchParams.get("minPrice") || "0");
  const maxPrice = parseFloat(searchParams.get("maxPrice") || "10000");
  const rating = parseFloat(searchParams.get("rating") || "0");
  const gender = searchParams.get("gender") || "";
  const interests = parsePreferenceList(searchParams.get("interests"));
  const languages = parsePreferenceList(searchParams.get("languages"));
  const travelerType = searchParams.get("travelerType") || "";
  const safetyPreference = searchParams.get("safetyPreference") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 9;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    status: "APPROVED",
    bio: { not: null },
    languages: { not: null },
    interests: { not: null },
    cityId: { not: null },
    pricePerHour: { gt: 0, gte: minPrice, lte: maxPrice },
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

  try {
    const candidates = await prisma.guideProfile.findMany({
      where,
      include: {
        user: true,
        city: true,
        availability: {
          where: {
            isBooked: false,
            date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
          take: 3,
        },
      },
      orderBy: { rating: "desc" },
    });

    const scoredGuides = candidates
      .map((guide) => ({
        ...guide,
        recommendation: scoreGuideRecommendation(guide, {
          city,
          languages,
          interests,
          travelerType,
          safetyPreference,
          minPrice,
          maxPrice,
        }),
      }))
      .filter((guide) => interests.length === 0 || guide.recommendation.scoreBreakdown.interests > 0)
      .sort((a, b) => b.recommendation.matchScore - a.recommendation.matchScore || b.rating - a.rating);

    const guides = scoredGuides.slice(skip, skip + limit);
    const total = scoredGuides.length;

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
