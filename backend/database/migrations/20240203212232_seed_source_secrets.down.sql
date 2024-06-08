DELETE FROM "source_secrets" WHERE "created_user_id" = (SELECT id FROM "users" WHERE name = 'system');
