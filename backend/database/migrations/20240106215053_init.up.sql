CREATE EXTENSION "moddatetime";
CREATE EXTENSION "pgcrypto";

CREATE FUNCTION nanoid()
    RETURNS text
    LANGUAGE plpgsql
    VOLATILE
    LEAKPROOF
    PARALLEL SAFE
AS
$$
DECLARE
    size           int    := 12;
    mask           int    := 63;
    step           int    := 37;
    idBuilder      text   := '';
    counter        int    := 0;
    bytes          bytea;
    alphabetIndex  int;
    alphabetArray  text[] := regexp_split_to_array('0123456789abcdefghijklmnopqrstuvwxyz', '');
    alphabetLength int    := 36;
BEGIN
    LOOP
        bytes := gen_random_bytes(step);
        FOR counter IN 0..step - 1
            LOOP
                alphabetIndex := (get_byte(bytes, counter) & mask) + 1;
                IF alphabetIndex <= alphabetLength THEN
                    idBuilder := idBuilder || alphabetArray[alphabetIndex];
                    IF length(idBuilder) = size THEN
                        RETURN idBuilder;
                    END IF;
                END IF;
            END LOOP;
    END LOOP;
END
$$;

CREATE TYPE "source_kind" AS ENUM ('system', 'javascript', 'python');
CREATE TYPE "server_config_kind" AS ENUM ('string', 'number', 'boolean', 'code');

CREATE TABLE IF NOT EXISTS "providers" (
    "id" TEXT PRIMARY KEY DEFAULT nanoid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "favicon" TEXT,
    "tags" TEXT[] NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "sources" (
    "id" TEXT PRIMARY KEY DEFAULT nanoid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "favicon" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "supported_indicators" TEXT[] NOT NULL DEFAULT '{}',
    "disabled_indicators" TEXT[] NOT NULL DEFAULT '{}',
    "task_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "task_interval" INTEGER,
    "config" JSONB[] NOT NULL DEFAULT '{}',
    "config_values" JSONB[] NOT NULL DEFAULT '{}',
    "limit_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "limit_count" INTEGER,
    "limit_interval" INTEGER,
    "kind" "source_kind" NOT NULL,
    "source_code" TEXT,
    "cache_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "cache_interval" INTEGER,

    "provider_id" TEXT,

    FOREIGN KEY ("provider_id") REFERENCES "providers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT "source_code_check" CHECK (
        ("kind" = 'system') OR
        ("kind" = 'javascript' AND "source_code" IS NOT NULL) OR
        ("kind" = 'python' AND "source_code" IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS "secrets" (
    "id" TEXT PRIMARY KEY DEFAULT nanoid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    "name" TEXT NOT NULL UNIQUE,
    "value" BYTEA NOT NULL,
    "description" TEXT,
    "expires_at" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "source_secrets" (
    "id" TEXT PRIMARY KEY DEFAULT nanoid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    "secret_id" TEXT,
    "source_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY ("secret_id") REFERENCES "secrets" ("id")  ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("source_id") REFERENCES "sources" ("id")  ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ignore_lists" (
    "id" TEXT PRIMARY KEY DEFAULT nanoid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "global" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "ignore_list_entries" (
    "id" TEXT PRIMARY KEY DEFAULT nanoid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    "data" TEXT NOT NULL,
    "indicator_kind" TEXT NOT NULL,
    "ignore_list_id" TEXT NOT NULL,

    FOREIGN KEY ("ignore_list_id") REFERENCES "ignore_lists" ("id")  ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE ("data", "indicator_kind", "ignore_list_id")
);

CREATE TABLE IF NOT EXISTS "source_ignore_lists" (
    "id" TEXT PRIMARY KEY DEFAULT nanoid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    "ignore_list_id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,

    FOREIGN KEY ("ignore_list_id") REFERENCES "ignore_lists" ("id")  ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("source_id") REFERENCES "sources" ("id")  ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE ("ignore_list_id", "source_id")
);

CREATE TABLE IF NOT EXISTS "provider_ignore_lists" (
    "id" TEXT PRIMARY KEY DEFAULT nanoid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    "ignore_list_id" TEXT NOT NULL,
    "source_provider_id" TEXT NOT NULL,

    FOREIGN KEY ("ignore_list_id") REFERENCES "ignore_lists" ("id")  ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("source_provider_id") REFERENCES "providers" ("id")  ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE ("ignore_list_id", "source_provider_id")
);

CREATE TABLE IF NOT EXISTS "requests" (
    "id" TEXT PRIMARY KEY DEFAULT nanoid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    "data" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "trace_id" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "source_requests" (
    "id" TEXT PRIMARY KEY DEFAULT nanoid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL,
    "errors" JSONB[] NOT NULL DEFAULT '{}',
    "data" JSONB,
    "cache_action" TEXT,
    "cache_expires_at" TIMESTAMP(3),
    "cache_cached_at" TIMESTAMP(3),
    "cache_key" TEXT,

    "request_id" TEXT NOT NULL,
    "source_id" TEXT,
    "source_name" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "source_favicon" TEXT,

    FOREIGN KEY ("request_id") REFERENCES "requests" ("id")  ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("source_id") REFERENCES "sources" ("id")  ON DELETE SET NULL ON UPDATE CASCADE,

    UNIQUE ("request_id", "source_id")
);

CREATE TABLE IF NOT EXISTS "server_config" (
    "id" TEXT PRIMARY KEY DEFAULT nanoid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL
);

CREATE TRIGGER "source_providers_updated_at" BEFORE UPDATE ON "providers" FOR EACH ROW EXECUTE PROCEDURE "moddatetime" ("updated_at");
CREATE TRIGGER "sources_updated_at" BEFORE UPDATE ON "sources" FOR EACH ROW EXECUTE PROCEDURE "moddatetime" ("updated_at");
CREATE TRIGGER "secrets_updated_at" BEFORE UPDATE ON "secrets" FOR EACH ROW EXECUTE PROCEDURE "moddatetime" ("updated_at");
CREATE TRIGGER "source_secrets_updated_at" BEFORE UPDATE ON "source_secrets" FOR EACH ROW EXECUTE PROCEDURE "moddatetime" ("updated_at");
CREATE TRIGGER "ignore_lists_updated_at" BEFORE UPDATE ON "ignore_lists" FOR EACH ROW EXECUTE PROCEDURE "moddatetime" ("updated_at");
CREATE TRIGGER "ignore_list_entries_updated_at" BEFORE UPDATE ON "ignore_list_entries" FOR EACH ROW EXECUTE PROCEDURE "moddatetime" ("updated_at");
CREATE TRIGGER "source_ignore_lists_updated_at" BEFORE UPDATE ON "source_ignore_lists" FOR EACH ROW EXECUTE PROCEDURE "moddatetime" ("updated_at");
CREATE TRIGGER "provider_ignore_lists_updated_at" BEFORE UPDATE ON "provider_ignore_lists" FOR EACH ROW EXECUTE PROCEDURE "moddatetime" ("updated_at");
CREATE TRIGGER "requests_updated_at" BEFORE UPDATE ON "requests" FOR EACH ROW EXECUTE PROCEDURE "moddatetime" ("updated_at");
CREATE TRIGGER "source_requests_updated_at" BEFORE UPDATE ON "source_requests" FOR EACH ROW EXECUTE PROCEDURE "moddatetime" ("updated_at");
CREATE TRIGGER "server_config_updated_at" BEFORE UPDATE ON "server_config" FOR EACH ROW EXECUTE PROCEDURE "moddatetime" ("updated_at");
