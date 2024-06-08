DELETE FROM "providers" WHERE "created_user_id" = (SELECT id FROM "users" WHERE name = 'system');
