CREATE TABLE IF NOT EXISTS "url_haus" (
  "id" INTEGER PRIMARY KEY NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "dateadded" TIMESTAMP NOT NULL,
  "url" TEXT NOT NULL,
  "url_status" TEXT NOT NULL,
  "last_online" TIMESTAMP,
  "threat" TEXT NOT NULL,
  "tags" TEXT NOT NULL,
  "urlhaus_link" TEXT NOT NULL,
  "reporter" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "url_haus_refreshes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "refreshed_at"  TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "response_headers" TEXT NOT NULL
);