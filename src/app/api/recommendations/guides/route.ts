import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  blendSemanticRecommendation,
  parsePreferenceList,
  scoreGuideRecommendation,
} from "@/lib/recommendations";
import { buildRecommendationQueryText, getGuideSemanticScores } from "@/lib/embeddings";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "";
  const interests = parsePreferenceList(searchParams.get("interests"));
  const languages = parsePreferenceList(searchParams.get("languages"));
  const safetyPreference = searchParams.get("safetyPreference") || "";
  const travelerType = searchParams.get("travelerType") || "";
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 10000);

  try {
    const guides = await prisma.guideProfile.findMany({
      where: {
        status: "APPROVED",
        isVerified: true,
        bio: { not: null },
        languages: { not: null },
        interests: { not: null },
        cityId: { not: null },
        pricePerHour: { gt: 0 },
      },
      include: {
        user: { select: { name: true, image: true } },
        city: true,
        availability: {
          where: {
            isBooked: false,
            date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
          take: 3,
        },
      },
    });

    const preferences = {
      city,
      interests,
      languages,
      safetyPreference,
      travelerType,
      minPrice,
      maxPrice,
    };
    const semantic = await getGuideSemanticScores(
      guides.map((guide) => guide.id),
      buildRecommendationQueryText(preferences)
    );

    const recommendations = guides
      .map((guide) => {
        const deterministicRecommendation = scoreGuideRecommendation(guide, {
          city,
          interests,
          languages,
          safetyPreference,
          travelerType,
          minPrice,
          maxPrice,
        });

        return {
          guide,
          recommendation: blendSemanticRecommendation(
            deterministicRecommendation,
            semantic.scores.get(guide.id) ?? null,
            semantic.available,
            semantic.reason
          ),
        };
      })
      .sort((a, b) => b.recommendation.matchScore - a.recommendation.matchScore)
      .slice(0, 10);

    return NextResponse.json({
      recommendations,
      semantic: {
        available: semantic.available,
        reason: semantic.reason,
      },
    });
  } catch (error) {
    console.error("Guide recommendation error:", error);
    return NextResponse.json({ error: "Could not generate guide recommendations." }, { status: 500 });
  }
}
