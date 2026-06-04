CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "GuideProfile"
ADD COLUMN "embedding" vector(768),
ADD COLUMN "embeddingText" TEXT,
ADD COLUMN "embeddingUpdatedAt" TIMESTAMP(3);

ALTER TABLE "Experience"
ADD COLUMN "embedding" vector(768),
ADD COLUMN "embeddingText" TEXT,
ADD COLUMN "embeddingUpdatedAt" TIMESTAMP(3);

CREATE INDEX "GuideProfile_embedding_idx"
ON "GuideProfile"
USING ivfflat ("embedding" vector_cosine_ops)
WITH (lists = 100)
WHERE "embedding" IS NOT NULL;

CREATE INDEX "Experience_embedding_idx"
ON "Experience"
USING ivfflat ("embedding" vector_cosine_ops)
WITH (lists = 100)
WHERE "embedding" IS NOT NULL;
