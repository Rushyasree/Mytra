# Phase 5: Semantic Recommendations

This phase adds pgvector-ready semantic search on top of the Phase 4 deterministic recommendation engine.

## What Changed

- Added vector storage to `GuideProfile` and `Experience`.
- Added `src/lib/embeddings.ts` for:
  - searchable guide text generation
  - searchable experience text generation
  - Gemini embedding calls
  - raw pgvector similarity queries
  - safe fallback metadata
- Added `POST /api/admin/embeddings` for admin-only embedding backfills.
- Added `GET /api/admin/embeddings` for embedding coverage status.
- Updated guide search and recommendation APIs to blend deterministic and semantic scores.
- Added `GET /api/recommendations/experiences`.

## Deployment Requirements

Use PostgreSQL with pgvector support. Neon, Supabase, and many managed PostgreSQL providers support this.

Required env:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
GEMINI_API_KEY="your-gemini-api-key"
```

Run migrations:

```bash
npx prisma migrate deploy
```

Then backfill embeddings as an admin:

```bash
curl -X POST https://YOUR_DOMAIN/api/admin/embeddings \
  -H "Content-Type: application/json" \
  -d '{"target":"all","mode":"missing","limit":25}'
```

Increase `limit` or rerun the route until `GET /api/admin/embeddings` reports low or zero missing rows.

## Scoring Formula

When semantic scores are available:

```text
final_score = deterministic_score * 0.65 + semantic_score * 0.35
```

When semantic scores are unavailable:

```text
final_score = deterministic_score
```

## Fallback Path

The app does not fail if embeddings are unavailable. API responses include semantic metadata:

```json
{
  "semantic": {
    "available": false,
    "reason": "no_guide_embeddings"
  }
}
```

Known fallback reasons:

- `embedding_unavailable`: no usable `GEMINI_API_KEY`, empty query, or bad embedding response
- `pgvector_unavailable`: extension/table/vector query is unavailable
- `no_guide_embeddings`: guide rows have not been backfilled
- `no_experience_embeddings`: experience rows have not been backfilled

This lets production launch with deterministic scoring first, then improve automatically as embeddings are generated.
