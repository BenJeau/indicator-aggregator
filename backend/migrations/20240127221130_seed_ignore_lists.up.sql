INSERT INTO "ignore_lists"
  ("name", "description", "enabled", "global")
VALUES
  ('Google', 'Google related indicators', TRUE, TRUE);


INSERT INTO "ignore_list_entries"
  ("data", "indicator_kind", "ignore_list_id")
VALUES
  ('google.com', 'DOMAIN', (SELECT id FROM "ignore_lists" WHERE name = 'Google')),
  ('google.ca', 'DOMAIN',  (SELECT id FROM "ignore_lists" WHERE name = 'Google'));
