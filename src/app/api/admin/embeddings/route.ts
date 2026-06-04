import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";
import {
  embeddingsAvailable,
  refreshExperienceEmbedding,
  refreshGuideEmbedding,
} from "@/lib/embeddings";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const [guidesTotal, guidesEmbedded, experiencesTotal, experiencesEmbedded] = await Promise.all([
    prisma.guideProfile.count({ where: { status: "APPROVED" } }),
    prisma.guideProfile.count({ where: { status: "APPROVED", embeddingUpdatedAt: { not: null } } }),
    prisma.experience.count(),
    prisma.experience.count({ where: { embeddingUpdatedAt: { not: null } } }),
  ]);

  return NextResponse.json({
    providerAvailable: embeddingsAvailable(),
    guides: { total: guidesTotal, embedded: guidesEmbedded, missing: guidesTotal - guidesEmbedded },
    experiences: {
      total: experiencesTotal,
      embedded: experiencesEmbedded,
      missing: experiencesTotal - experiencesEmbedded,
    },
  });
}

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  if (!embeddingsAvailable()) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is required before embeddings can be generated." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const target = body.target === "guides" || body.target === "experiences" ? body.target : "all";
  const mode = body.mode === "all" ? "all" : "missing";
  const limit = Math.min(Math.max(Number(body.limit || 25), 1), 100);

  let guideUpdates = 0;
  let experienceUpdates = 0;

  if (target === "guides" || target === "all") {
    const guides = await prisma.guideProfile.findMany({
      where: {
        status: "APPROVED",
        ...(mode === "missing" ? { embeddingUpdatedAt: null } : {}),
      },
      include: {
        user: { select: { name: true } },
        city: { select: { name: true, state: true } },
      },
      take: limit,
      orderBy: { id: "asc" },
    });

    for (const guide of guides) {
      if (await refreshGuideEmbedding(guide)) guideUpdates += 1;
    }
  }

  if (target === "experiences" || target === "all") {
    const experiences = await prisma.experience.findMany({
      where: mode === "missing" ? { embeddingUpdatedAt: null } : {},
      include: {
        city: { select: { name: true, state: true } },
      },
      take: limit,
      orderBy: { title: "asc" },
    });

    for (const experience of experiences) {
      if (await refreshExperienceEmbedding(experience)) experienceUpdates += 1;
    }
  }

  return NextResponse.json({
    updated: {
      guides: guideUpdates,
      experiences: experienceUpdates,
    },
    fallback: guideUpdates + experienceUpdates === 0 ? "No embeddings were written; deterministic scoring remains active." : null,
  });
}
