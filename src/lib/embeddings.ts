import { GoogleGenerativeAI } from "@google/generative-ai";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { GuideRecommendationPreferences } from "@/lib/recommendations";

const EMBEDDING_MODEL = "embedding-001";
const EMBEDDING_DIMENSIONS = 768;

type GuideEmbeddingSource = {
  id: string;
  bio: string | null;
  university: string | null;
  languages: string | null;
  interests: string | null;
  gender: string;
  pricePerHour: number;
  rating: number;
  user?: { name?: string | null } | null;
  city?: { name?: string | null; state?: string | null } | null;
};

type ExperienceEmbeddingSource = {
  id: string;
  title: string;
  description: string;
  category: string;
  tag: string | null;
  price: number;
  duration: number;
  city?: { name?: string | null; state?: string | null } | null;
};

type SemanticScoreRow = {
  id: string;
  semanticScore: number | string | null;
};

export type SemanticScoreResult = {
  scores: Map<string, number>;
  available: boolean;
  reason?: string;
};

function cleanParts(parts: Array<string | number | null | undefined>) {
  return parts
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(" | ");
}

function embeddingClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") return null;
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: EMBEDDING_MODEL });
}

function vectorLiteral(values: number[]) {
  return `[${values.map((value) => Number(value).toFixed(6)).join(",")}]`;
}

function normalizeSemanticScore(value: number | string | null) {
  const score = typeof value === "string" ? Number(value) : value ?? 0;
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(1, score));
}

export function embeddingsAvailable() {
  return Boolean(embeddingClient());
}

export function buildGuideEmbeddingText(guide: GuideEmbeddingSource) {
  return cleanParts([
    guide.user?.name,
    guide.city?.name,
    guide.city?.state,
    guide.university,
    guide.bio,
    guide.languages && `Languages: ${guide.languages}`,
    guide.interests && `Interests: ${guide.interests}`,
    `Gender: ${guide.gender}`,
    `Hourly rate INR ${guide.pricePerHour}`,
    `Rating ${guide.rating}/5`,
  ]);
}

export function buildExperienceEmbeddingText(experience: ExperienceEmbeddingSource) {
  return cleanParts([
    experience.title,
    experience.description,
    experience.category,
    experience.tag && `Tag: ${experience.tag}`,
    experience.city?.name,
    experience.city?.state,
    `Price INR ${experience.price}`,
    `Duration ${experience.duration} minutes`,
  ]);
}

export function buildRecommendationQueryText(
  preferences: GuideRecommendationPreferences & { q?: string }
) {
  return cleanParts([
    preferences.q,
    preferences.city && `City: ${preferences.city}`,
    preferences.interests?.length ? `Interests: ${preferences.interests.join(", ")}` : null,
    preferences.languages?.length ? `Languages: ${preferences.languages.join(", ")}` : null,
    preferences.travelerType && `Traveler type: ${preferences.travelerType}`,
    preferences.safetyPreference && `Safety preference: ${preferences.safetyPreference}`,
    preferences.minPrice || preferences.maxPrice
      ? `Budget INR ${preferences.minPrice ?? 0} to ${preferences.maxPrice ?? 10000}`
      : null,
  ]);
}

export async function generateEmbedding(text: string) {
  const model = embeddingClient();
  const normalizedText = text.trim();
  if (!model || !normalizedText) return null;

  const result = await model.embedContent(normalizedText.slice(0, 8000));
  const values = result.embedding.values;
  if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) {
    console.warn(
      `Embedding dimension mismatch. Expected ${EMBEDDING_DIMENSIONS}, received ${values?.length ?? 0}.`
    );
    return null;
  }

  return values;
}

export async function refreshGuideEmbedding(guide: GuideEmbeddingSource) {
  const text = buildGuideEmbeddingText(guide);
  const embedding = await generateEmbedding(text);
  if (!embedding) return false;

  await prisma.$executeRaw`
    UPDATE "GuideProfile"
    SET "embedding" = ${vectorLiteral(embedding)}::vector,
        "embeddingText" = ${text},
        "embeddingUpdatedAt" = NOW()
    WHERE "id" = ${guide.id}
  `;

  return true;
}

export async function refreshExperienceEmbedding(experience: ExperienceEmbeddingSource) {
  const text = buildExperienceEmbeddingText(experience);
  const embedding = await generateEmbedding(text);
  if (!embedding) return false;

  await prisma.$executeRaw`
    UPDATE "Experience"
    SET "embedding" = ${vectorLiteral(embedding)}::vector,
        "embeddingText" = ${text},
        "embeddingUpdatedAt" = NOW()
    WHERE "id" = ${experience.id}
  `;

  return true;
}

export async function getGuideSemanticScores(ids: string[], queryText: string): Promise<SemanticScoreResult> {
  const embedding = await generateEmbedding(queryText);
  if (!embedding) return { scores: new Map(), available: false, reason: "embedding_unavailable" };
  if (ids.length === 0) return { scores: new Map(), available: true };

  try {
    const rows = await prisma.$queryRaw<SemanticScoreRow[]>`
      SELECT "id", GREATEST(0, LEAST(1, 1 - ("embedding" <=> ${vectorLiteral(embedding)}::vector))) AS "semanticScore"
      FROM "GuideProfile"
      WHERE "id" IN (${Prisma.join(ids)}) AND "embedding" IS NOT NULL
    `;

    return {
      available: rows.length > 0,
      reason: rows.length > 0 ? undefined : "no_guide_embeddings",
      scores: new Map(rows.map((row) => [row.id, normalizeSemanticScore(row.semanticScore)])),
    };
  } catch (error) {
    console.error("Guide semantic scoring unavailable:", error);
    return { scores: new Map(), available: false, reason: "pgvector_unavailable" };
  }
}

export async function getExperienceSemanticScores(ids: string[], queryText: string): Promise<SemanticScoreResult> {
  const embedding = await generateEmbedding(queryText);
  if (!embedding) return { scores: new Map(), available: false, reason: "embedding_unavailable" };
  if (ids.length === 0) return { scores: new Map(), available: true };

  try {
    const rows = await prisma.$queryRaw<SemanticScoreRow[]>`
      SELECT "id", GREATEST(0, LEAST(1, 1 - ("embedding" <=> ${vectorLiteral(embedding)}::vector))) AS "semanticScore"
      FROM "Experience"
      WHERE "id" IN (${Prisma.join(ids)}) AND "embedding" IS NOT NULL
    `;

    return {
      available: rows.length > 0,
      reason: rows.length > 0 ? undefined : "no_experience_embeddings",
      scores: new Map(rows.map((row) => [row.id, normalizeSemanticScore(row.semanticScore)])),
    };
  } catch (error) {
    console.error("Experience semantic scoring unavailable:", error);
    return { scores: new Map(), available: false, reason: "pgvector_unavailable" };
  }
}
