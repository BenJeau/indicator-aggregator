INSERT INTO users (auth_id, provider, enabled, email, verified, name, given_name, family_name, locale, picture, roles)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
ON CONFLICT (email, provider) DO UPDATE SET
    verified = EXCLUDED.verified,
    name = EXCLUDED.name,
    given_name = EXCLUDED.given_name,
    family_name = EXCLUDED.family_name,
    locale = EXCLUDED.locale,
    picture = EXCLUDED.picture
RETURNING *;
