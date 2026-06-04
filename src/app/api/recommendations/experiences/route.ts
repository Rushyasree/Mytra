import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildRecommendationQueryText, getExperienceSemanticScores } from "@/lib/embeddings";
import { parsePreferenceList } from "@/lib/recommendations";

function deterministicExperienceScore(
  experience: {
    category: string;
    tag: string | null;
    price: number;
    city?: { name: string } | null;
  },
  preferences: {
    city?: string;
    interests: string[];
    minPrice: number;
    maxPrice: number;
  }
) {
  const cityScore =
    !preferences.city || experience.city?.name.toLowerCase().includes(preferences.city.toLowerCase())
      ? 1
      : 0;
  const category = experience.category.toLowerCase();
  const tag = experience.tag?.toLowerCase() || "";
  const interestScore =
    preferences.interests.length === 0
      ? 1
      : preferences.interests.some((interest) => {
          const normalized = interest.toLowerCase();
          return category.includes(normalized) || tag.includes(normalized);
        })
        ? 1
        : 0.25;
  const budgetScore =
    experience.price >= preferences.minPrice && experience.price <= preferences.maxPrice
      ? 1
      : Math.max(0, 1 - Math.abs(experience.price - preferences.maxPrice) / Math.max(preferences.maxPrice, 1));

  return cityScore * 0.35 + interestScore * 0.45 + budgetScore * 0.2;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const interests = parsePreferenceList(searchParams.get("interests"));
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 10000);

  try {
    const experiences = await prisma.experience.findMany({
      where: {
        price: { gte: minPrice, lte: maxPrice },
        ...(city ? { city: { name: { contains: city } } } : {}),
      },
      include: { city: true },
      take: 50,
    });

    const semantic = await getExperienceSemanticScores(
      experiences.map((experience) => experience.id),
      buildRecommendationQueryText({ q, city, interests, minPrice, maxPrice })
    );

    const recommendations = experiences
      .map((experience) => {
        const deterministic = deterministicExperienceScore(experience, {
          city,
          interests,
          minPrice,
          maxPrice,
        });
        const semanticScore = semantic.scores.get(experience.id) ?? null;
        const finalScore =
          semantic.available && semanticScore !== null
            ? deterministic * 0.65 + semanticScore * 0.35
            : deterministic;

        return {
          experience,
          recommendation: {
            matchScore: Math.round(finalScore * 100),
            deterministicScore: Math.round(deterministic * 100),
            semanticScore: semanticScore === null ? null : Math.round(semanticScore * 100),
            semanticAvailable: semantic.available,
            semanticReason: semantic.available ? undefined : semantic.reason,
          },
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
    console.error("Experience recommendation error:", error);
    return NextResponse.json({ error: "Could not generate experience recommendations." }, { status: 500 });
  }
}
