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

Phase 5 semantic search has now been added:

- embed guide bios
- embed experience descriptions
- store vectors with PostgreSQL + pgvector
- combine semantic similarity with the deterministic score

```
final_score = recommendation_score * 0.65 + semantic_score * 0.35
```

## Phase 5 Semantic Upgrade

### Storage

The Prisma schema now includes pgvector-ready fields on `GuideProfile` and `Experience`:

- `embedding Unsupported("vector(768)")?`
- `embeddingText String?`
- `embeddingUpdatedAt DateTime?`

Migration:

```bash
npx prisma migrate deploy
```

The migration enables pgvector:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

and creates cosine IVFFlat indexes for guide and experience vectors.

### Embedding Generation

Embeddings are generated with the existing Gemini dependency using `GEMINI_API_KEY`.

Admin-only backfill route:

```bash
POST /api/admin/embeddings
```

Request examples:

```json
{ "target": "all", "mode": "missing", "limit": 25 }
```

```json
{ "target": "guides", "mode": "all", "limit": 50 }
```

Status route:

```bash
GET /api/admin/embeddings
```

### Semantic Ranking

Updated routes:

- `GET /api/guides/search`
- `GET /api/recommendations/guides`
- `GET /api/recommendations/experiences`

When embeddings are available, guide scores expose:

- `matchScore`: final blended score
- `deterministicScore`: original rule-based score
- `semanticScore`: vector similarity score
- `semanticAvailable`: whether semantic scoring was used
- `semanticReason`: fallback reason when unavailable

### Fallback Behavior

Semantic search is optional and non-blocking. The API automatically falls back to deterministic scoring when:

- `GEMINI_API_KEY` is missing
- pgvector is not installed
- embedding columns are not migrated yet
- candidate rows do not have embeddings yet
- the embedding provider returns an unexpected vector size

Fallback reasons can include:

- `embedding_unavailable`
- `pgvector_unavailable`
- `no_guide_embeddings`
- `no_experience_embeddings`

This keeps guide discovery working during local development, first deploys, and partial backfills.
