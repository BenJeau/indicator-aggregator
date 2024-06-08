INSERT INTO "providers"
  ("name", "slug", "description", "url", "tags", "enabled", "created_user_id")
VALUES
  ('AlienVault OTX', 'alienvault-otx', 'AlienVault Open Threat Exchange', 'https://otx.alienvault.com/', '{"threat-intelligence"}', TRUE, (SELECT id FROM "users" WHERE name = 'system')),
  ('Shodan.io', 'shodan-io', '', 'https://shodan.io', '{"threat-intelligence"}', TRUE, (SELECT id FROM "users" WHERE name = 'system')),
  ('Google', 'google', '', 'https://google.com', '{}', TRUE, (SELECT id FROM "users" WHERE name = 'system')),
  ('Abuse.ch', 'abuse-ch', '', 'https://abuse.ch', '{}', TRUE, (SELECT id FROM "users" WHERE name = 'system')),
  ('Cisco Talos', 'cisco-talos', '', 'https://talosintelligence.com/', '{}', TRUE, (SELECT id FROM "users" WHERE name = 'system')),
  ('OpenPhish', 'openphish', '', 'https://openphish.com/', '{}', TRUE, (SELECT id FROM "users" WHERE name = 'system')),
  ('HaveIBeenPwned', 'haveibeenpwned', '', 'https://haveibeenpwned.com/', '{}', TRUE, (SELECT id FROM "users" WHERE name = 'system')),
  ('URLScan.io', 'urlscan-io', '', 'https://urlscan.io/', '{}', TRUE, (SELECT id FROM "users" WHERE name = 'system')),
  ('Cymru', 'cymru', '', 'https://cymru.com/', '{}', TRUE, (SELECT id FROM "users" WHERE name = 'system')),
  ('AbuseIPDB', 'abuseipdb', '', 'https://www.abuseipdb.com/', '{}', TRUE, (SELECT id FROM "users" WHERE name = 'system')),
  ('Internet Archive', 'internet-archive', '', 'https://archive.org/', '{}', TRUE, (SELECT id FROM "users" WHERE name = 'system'));
