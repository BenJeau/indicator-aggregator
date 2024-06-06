INSERT INTO "source_secrets"
  ("source_id", "description", "required", "name", "created_user_id")
VALUES
  ((SELECT id FROM sources WHERE name = 'Megatron'), 'API Key', TRUE, 'MEGATRON_KEY', (SELECT id FROM "users" WHERE name = 'system')),
  ((SELECT id FROM sources WHERE name = 'Shodan'), 'API Key', TRUE, 'SHODAN_KEY', (SELECT id FROM "users" WHERE name = 'system')),
  ((SELECT id FROM sources WHERE name = 'InternetDB'), 'API Key', TRUE, 'INTERNET_DB_KEY', (SELECT id FROM "users" WHERE name = 'system')),
  ((SELECT id FROM sources WHERE name = 'Google Safe Browsing - Update'), 'API Key', TRUE, 'GSB_UPDATE_KEY', (SELECT id FROM "users" WHERE name = 'system')),
  ((SELECT id FROM sources WHERE name = 'Google Safe Browsing - Lookup'), 'API Key', TRUE, 'GSB_LOOKUP_KEY', (SELECT id FROM "users" WHERE name = 'system')),
  ((SELECT id FROM sources WHERE name = 'VirusTotal'), 'API Key', FALSE, 'VIRUS_TOTAL_KEY', (SELECT id FROM "users" WHERE name = 'system')),
  ((SELECT id FROM sources WHERE name = 'HaveIBeenPwned'), 'API Key', TRUE, 'HIBP_KEY', (SELECT id FROM "users" WHERE name = 'system')),
  ((SELECT id FROM sources WHERE name = 'AbuseIPDB'), 'API Key', TRUE, 'ABUSE_IPBD_KEY', (SELECT id FROM "users" WHERE name = 'system')),
  ((SELECT id FROM sources WHERE name = 'URLScan.io - Search'), 'API Key', FALSE, 'URLSCAN_IO_KEY', (SELECT id FROM "users" WHERE name = 'system')),
  ((SELECT id FROM sources WHERE name = 'URLScan.io - Submit'), 'API Key', TRUE, 'URLSCAN_IO_KEY', (SELECT id FROM "users" WHERE name = 'system')),
  ((SELECT id FROM sources WHERE name = 'Internet Archive'),'API Key', FALSE, 'INTERNET_ARCHIVE_KEY', (SELECT id FROM "users" WHERE name = 'system'));

-- # [cloudflare]
-- # [censys]
-- # [cira]
