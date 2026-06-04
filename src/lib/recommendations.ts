type GuideCandidate = {
  id: string;
  languages: string | null;
  interests: string | null;
  pricePerHour: number;
  rating: number;
  gender: string;
  city?: { name: string } | null;
  availability?: { isBooked: boolean }[];
};

export type GuideRecommendationPreferences = {
  city?: string;
  languages?: string[];
  interests?: string[];
  travelerType?: string;
  safetyPreference?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type GuideRecommendationMeta = {
  matchScore: number;
  deterministicScore: number;
  semanticScore: number | null;
  semanticAvailable: boolean;
  semanticReason?: string;
  matchReasons: string[];
  scoreBreakdown: {
    city: number;
    language: number;
    interests: number;
    budget: number;
    rating: number;
    safety: number;
    availability: number;
    semantic: number | null;
  };
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function splitCsv(value: string | null | undefined) {
  if (!value) return [];
  return value.split(",").map(normalize).filter(Boolean);
}

function overlapScore(candidateValues: string[], preferredValues: string[]) {
  if (preferredValues.length === 0) return 1;
  if (candidateValues.length === 0) return 0;

  const candidateSet = new Set(candidateValues);
  const matches = preferredValues.filter((value) =>
    candidateSet.has(value) ||
    candidateValues.some((candidate) => candidate.includes(value) || value.includes(candidate))
  );

  return Math.min(1, matches.length / preferredValues.length);
}

function budgetScore(price: number, minPrice = 0, maxPrice = 10000) {
  if (price >= minPrice && price <= maxPrice) return 1;
  if (price > maxPrice) {
    const overage = price - maxPrice;
    return Math.max(0, 1 - overage / Math.max(maxPrice, 1));
  }

  const underage = minPrice - price;
  return Math.max(0, 1 - underage / Math.max(minPrice, 1));
}

function ratingScore(rating: number) {
  return Math.max(0, Math.min(1, rating / 5));
}

function safetyScore(guide: GuideCandidate, preference?: string) {
  const normalizedPreference = normalize(preference || "");
  if (!normalizedPreference) return 1;
  if (normalizedPreference.includes("female") || normalizedPreference.includes("solo")) {
    return guide.gender === "female" ? 1 : 0.55;
  }
  return 1;
}

function cityScore(guide: GuideCandidate, city?: string) {
  if (!city) return 1;
  const guideCity = normalize(guide.city?.name || "");
  const preferredCity = normalize(city);
  if (!guideCity) return 0;
  return guideCity.includes(preferredCity) || preferredCity.includes(guideCity) ? 1 : 0;
}

function availabilityScore(guide: GuideCandidate) {
  if (!guide.availability) return 0.5;
  return guide.availability.some((slot) => !slot.isBooked) ? 1 : 0.35;
}

export function scoreGuideRecommendation(
  guide: GuideCandidate,
  preferences: GuideRecommendationPreferences
): GuideRecommendationMeta {
  const preferredLanguages = preferences.languages?.map(normalize).filter(Boolean) ?? [];
  const preferredInterests = preferences.interests?.map(normalize).filter(Boolean) ?? [];
  const guideLanguages = splitCsv(guide.languages);
  const guideInterests = splitCsv(guide.interests);

  const scoreBreakdown = {
    city: cityScore(guide, preferences.city),
    language: overlapScore(guideLanguages, preferredLanguages),
    interests: overlapScore(guideInterests, preferredInterests),
    budget: budgetScore(guide.pricePerHour, preferences.minPrice, preferences.maxPrice),
    rating: ratingScore(guide.rating),
    safety: safetyScore(guide, preferences.safetyPreference || preferences.travelerType),
    availability: availabilityScore(guide),
  };

  const weightedScore =
    scoreBreakdown.city * 0.18 +
    scoreBreakdown.language * 0.15 +
    scoreBreakdown.interests * 0.22 +
    scoreBreakdown.budget * 0.12 +
    scoreBreakdown.rating * 0.13 +
    scoreBreakdown.safety * 0.1 +
    scoreBreakdown.availability * 0.1;

  const matchReasons: string[] = [];
  if (scoreBreakdown.city >= 1 && preferences.city) matchReasons.push("City match");
  if (scoreBreakdown.interests > 0 && preferredInterests.length > 0) matchReasons.push("Interest match");
  if (scoreBreakdown.language > 0 && preferredLanguages.length > 0) matchReasons.push("Language fit");
  if (scoreBreakdown.budget >= 1) matchReasons.push("Within budget");
  if (scoreBreakdown.safety >= 1 && preferences.safetyPreference) matchReasons.push("Safety preference fit");
  if (scoreBreakdown.availability >= 1) matchReasons.push("Has open slots");
  if (guide.rating >= 4.5) matchReasons.push("Highly rated");

  return {
    matchScore: Math.round(weightedScore * 100),
    deterministicScore: Math.round(weightedScore * 100),
    semanticScore: null,
    semanticAvailable: false,
    matchReasons: matchReasons.slice(0, 4),
    scoreBreakdown: { ...scoreBreakdown, semantic: null },
  };
}

export function parsePreferenceList(value: string | null) {
  if (!value) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function blendSemanticRecommendation(
  recommendation: GuideRecommendationMeta,
  semanticScore: number | null,
  semanticAvailable: boolean,
  semanticReason?: string
): GuideRecommendationMeta {
  if (!semanticAvailable || semanticScore === null) {
    return {
      ...recommendation,
      semanticScore: null,
      semanticAvailable: false,
      semanticReason,
    };
  }

  const deterministic = recommendation.deterministicScore / 100;
  const blended = deterministic * 0.65 + semanticScore * 0.35;
  const semanticReasonText = semanticScore >= 0.75 ? "Semantic profile match" : null;

  return {
    ...recommendation,
    matchScore: Math.round(blended * 100),
    semanticScore: Math.round(semanticScore * 100),
    semanticAvailable: true,
    semanticReason: undefined,
    matchReasons: semanticReasonText
      ? [semanticReasonText, ...recommendation.matchReasons].slice(0, 4)
      : recommendation.matchReasons,
    scoreBreakdown: {
      ...recommendation.scoreBreakdown,
      semantic: semanticScore,
    },
  };
}
