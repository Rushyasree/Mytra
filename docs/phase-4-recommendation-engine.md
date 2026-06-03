# Phase 4: Guide Recommendation Engine

This phase upgrades guide discovery from simple filtering to a scored recommendation system.

## Implemented

- Added reusable scoring engine in `src/lib/recommendations.ts`.
- Added `GET /api/recommendations/guides`.
- Updated `GET /api/guides/search` to return ranked guide results with recommendation metadata.
- Guide cards now show:
  - match percentage
  - match reasons
  - `Best Match` sorting

## Guide Match Factors

The current deterministic score combines:

- city match
- language overlap
- interest overlap
- budget fit
- guide rating
- safety preference
- open availability

Weights:

```text
city: 18%
language: 15%
interests: 22%
budget: 12%
rating: 13%
safety: 10%
availability: 10%
```

## API Example

```bash
GET /api/recommendations/guides?city=Delhi&interests=Food,Heritage&languages=English,Hindi&maxPrice=2000&safetyPreference=solo female
```

## Next Step

Phase 5 should add embeddings and semantic search:

- embed guide bios
- embed experience descriptions
- embed reviews
- store vectors with PostgreSQL + pgvector
- combine semantic similarity with the deterministic score
```
final_score = recommendation_score * 0.65 + semantic_score * 0.35
```
