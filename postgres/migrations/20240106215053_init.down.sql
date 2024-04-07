DROP TABLE "server_config";
DROP TABLE "source_requests";
DROP TABLE "requests";
DROP TABLE "provider_ignore_lists";
DROP TABLE "source_ignore_lists";
DROP TABLE "ignore_list_entries";
DROP TABLE "ignore_lists";
DROP TABLE "source_secrets";
DROP TABLE "secrets";
DROP TABLE "sources";
DROP TABLE "providers";

DROP TYPE "server_config_kind";
DROP TYPE "source_kind";

DROP EXTENSION "uuid-ossp";
DROP EXTENSION "moddatetime";
DROP EXTENSION "pgcrypto";