INSERT INTO "ignore_lists"
  ("name", "slug", "description", "enabled", "global", "created_user_id")
VALUES
  ('Google', 'google', 'Google related indicators', TRUE, TRUE, (SELECT id FROM "users" WHERE name = 'system'));


INSERT INTO "ignore_list_entries"
  ("data", "indicator_kind", "ignore_list_id", "created_user_id")
VALUES
  ('google.com', 'DOMAIN', (SELECT id FROM "ignore_lists" WHERE name = 'Google'), (SELECT id FROM "users" WHERE name = 'system')),
  ('google.ca', 'DOMAIN',  (SELECT id FROM "ignore_lists" WHERE name = 'Google'), (SELECT id FROM "users" WHERE name = 'system'));
