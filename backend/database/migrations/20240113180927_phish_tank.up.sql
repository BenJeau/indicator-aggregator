CREATE TABLE IF NOT EXISTS "phishtank" (
  "phish_id" INTEGER PRIMARY KEY NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "phish_detail_url" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "submission_time" TIMESTAMP NOT NULL,
  "verification_time" TIMESTAMP NOT NULL,
  "target" TEXT NOT NULL,
  "details" JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS "phishtank_refreshes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "refreshed_at"  TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "response_headers" TEXT NOT NULL
);