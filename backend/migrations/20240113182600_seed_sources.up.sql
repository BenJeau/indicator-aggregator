INSERT INTO "sources"
  ("name", "description", "url", "tags", "supported_indicators", "enabled", "task_enabled", "task_interval", "limit_count", "limit_interval", "provider_id", "kind", "cache_enabled", "cache_interval")
VALUES
  ('URLHaus', 'Abuse.ch URLhaus API verifying against malicious URLs and associated payloads', 'https://urlhaus.abuse.ch/', '{"threat-intelligence"}', '{"URL"}', TRUE, TRUE, 300, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'Abuse.ch'), 'system', FALSE, NULL),
  ('MalwareBazaar', 'Abuse.ch MalwareBazaar API verifying against malware samples', 'https://bazaar.abuse.ch/api/', '{}', '{"MD5", "SHA1", "SHA256"}', TRUE, FALSE, NULL, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'Abuse.ch'), 'system', FALSE, NULL),
  ('Megatron', 'Abuse.ch Megatron API verifying against botnet traffic', 'https://megatron.abuse.ch/', '{}', '{"IPV4", "IPV6"}', TRUE, TRUE, 300, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'Abuse.ch'), 'system', FALSE, NULL),
  ('ThreatFox', 'Abuse.ch ThreatFox API verifying against indicators of compromise within the information security community', 'https://threatfox.abuse.ch/api/', '{}', '{"MD5", "SHA1", "SHA256", "URL", "IPV4", "IPV6", "DOMAIN", "EMAIL"}', TRUE, FALSE, NULL, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'Abuse.ch'), 'system', FALSE, NULL),
  ('ASN Cymru', 'Raw socket connection to ASN Cymru whois service', 'https://asn.cymru.com/', '{}', '{"IPV4", "IPV6"}', TRUE, FALSE, NULL, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'Cymru'), 'system', FALSE, NULL),
  ('Shodan', 'Search engine that lets the user find specific types of computers (webcams, routers, servers, etc.) connected to the internet using a variety of filters', 'https://developer.shodan.io/api', '{}', '{"IPV4", "IPV6", "DOMAIN"}', TRUE, FALSE, NULL, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'Shodan.io'), 'system', FALSE, NULL),
  ('InternetDB', 'Overview of vulnerable devices on the Internet - subset of Shodan', 'https://internetdb.shodan.io/', '{}', '{"IPV4", "IPV6"}', TRUE, FALSE, NULL, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'Shodan.io'), 'system', FALSE, NULL),
  ('PhishTank', 'A collaborative clearing house for data and information about phishing on the Internet', 'https://www.phishtank.com/api_info.php', '{}', '{"URL", "DOMAIN", "IPV4", "IPV6"}', TRUE, TRUE, 3600, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'Cisco Talos'), 'system', FALSE, NULL),
  ('OpenPhish', 'OpenPhish is a non-profit, community-driven project dedicated to providing phishing intelligence', 'https://openphish.com/', '{}', '{"URL", "DOMAIN", "IPV4", "IPV6"}', TRUE, FALSE, NULL, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'OpenPhish'), 'system', FALSE, NULL),
  ('AlienVault OTX', 'AlienVault Open Threat Exchange', 'https://otx.alienvault.com/api', '{}', '{"IPV4", "IPV6", "DOMAIN", "URL", "MD5", "SHA1", "SHA256"}', TRUE, FALSE, NULL, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'AlienVault OTX'), 'system', FALSE, NULL),
  -- https://certstream.calidog.io/ - https://www.gstatic.com/ct/log_list/v3/all_logs_list.json - https://github.com/google/certificate-transparency-community-site/blob/master/docs/google/getting-started.md - https://crt.sh/
  -- ('Certificate Transparency', 'Certificate Transparency is an open framework for monitoring and auditing digital certificates', 'https://www.certificate-transparency.org/', '{}', '{"DOMAIN", "URL"}', TRUE, FALSE, NULL, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'Google'), 'system', FALSE, NULL),
  ('Google Safe Browsing - Update', 'Lookup URLs against Google Safe Browsing API, comparing against a local cache of known malicious URLs', 'https://developers.google.com/safe-browsing/v4/', '{}', '{"URL"}', TRUE, FALSE, NULL, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'Google'), 'system', FALSE, NULL),
  ('Google Safe Browsing - Lookup', 'Lookup URLs against Google Safe Browsing API, sending the full URL to Google', 'https://developers.google.com/safe-browsing/v4/', '{}', '{"URL"}', TRUE, FALSE, NULL, NULL, NULL, (SELECT id FROM "providers" WHERE name = 'Google'), 'system', FALSE, NULL),
  ('VirusTotal', '...', 'https://docs.virustotal.com/reference/overview', '{}', '{"MD5", "SHA1", "SHA256", "URL", "DOMAIN", "IPV4", "IPV6"}', TRUE, FALSE, NULL, 150, 60, (SELECT id FROM "providers" WHERE name = 'Google'), 'system', TRUE, 3600),
  ('HaveIBeenPwned', 'Database of breached credentials and compromised accounts', 'https://haveibeenpwned.com/API/v3', '{}', '{"EMAIL"}', TRUE, FALSE, NULL, 150, 60, (SELECT id FROM "providers" WHERE name = 'HaveIBeenPwned'), 'system', FALSE, NULL),
  ('DNS', 'Raw direct and reverse DNS lookups', 'https://github.com/hickory-dns/hickory-dns', '{}', '{"IPV4", "IPV6", "DOMAIN", "URL"}', TRUE, FALSE, NULL, NULL, NULL, NULL, 'system', FALSE, NULL),
  ('AbuseIPDB', 'AbuseIPDB is a project dedicated to helping combat the spread of hackers, spammers, and abusive activity on the internet.', 'https://docs.abuseipdb.com/', '{}', '{"IPV4", "IPV6"}', TRUE, FALSE, NULL, 30, 60, (SELECT id FROM "providers" WHERE name = 'AbuseIPDB'), 'system', TRUE, 3600),
  ('URLScan.io - Search', '...', 'https://urlscan.io/docs/api/', '{}', '{"URL", "DOMAIN"}', TRUE, FALSE, NULL, 150, 60, (SELECT id FROM "providers" WHERE name = 'URLScan.io'), 'system', FALSE, NULL),
  ('URLScan.io - Submit', '...', 'https://urlscan.io/docs/api/', '{}', '{"URL"}', TRUE, FALSE, NULL, 150, 60, (SELECT id FROM "providers" WHERE name = 'URLScan.io'), 'system', FALSE, NULL),
  ('Internet Archive', 'Stores archived versions of websites', 'https://archive.org/help/wayback_api.php', '{}', '{"URL"}', TRUE, FALSE, NULL, 150, 60, (SELECT id FROM "providers" WHERE name = 'URLScan.io'), 'system', FALSE, NULL);

INSERT INTO "sources"
  ("name", "description", "url", "tags", "supported_indicators", "enabled", "task_enabled", "task_interval", "limit_count", "limit_interval", "provider_id", "kind", "cache_enabled", "cache_interval", "source_code")
VALUES
  ('Simple Get Request Python', 'Execute a simple GET request on the indicator data', '...', '{}', '{"URL"}', TRUE, FALSE, NULL, NULL, NULL, NULL, 'python', FALSE, NULL, 'import urllib.request\n\ndef fetch(url):\n  try:\n    with urllib.request.urlopen(url) as response:\n      html_content = response.read().decode("utf-8", "ignore")\n    return html_content\n  except Exception as e:\n    print(f"An error occurred: {e}")\n    return None\n\ndef fetch_data(indicator_data, indicator_kind):\n  return fetch(indicator_data) or ""\n\ndef background_task():\n  pass');


-- # [cloudflare]
-- # [censys]
-- # [cira]
