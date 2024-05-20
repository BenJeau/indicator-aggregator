use sqlx::{PgPool, Result};
use tracing::instrument;

use crate::schemas::api_tokens::{ApiToken, CreateApiToken, GetApiToken, InternalUpdateApiToken};

#[instrument(skip(pool), ret, err)]
pub async fn update_or_create_api_token(
    pool: &PgPool,
    data: CreateApiToken,
    user_id: &str,
    hashed_token: &str,
) -> Result<String> {
    sqlx::query_scalar!(
        r#"INSERT INTO api_tokens (user_id, note, expires_at, token) VALUES ($1, $2, $3, $4) ON CONFLICT ("user_id", "note") DO UPDATE SET note = $2 RETURNING id"#,
        user_id,
        data.note,
        data.expires_at,
        hashed_token,
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_api_token(pool: &PgPool, id: &str, user_id: &str) -> Result<u64> {
    sqlx::query!(
        "DELETE FROM api_tokens WHERE id = $1 AND user_id = $2",
        id,
        user_id
    )
    .execute(pool)
    .await
    .map_err(Into::into)
    .map(|i| i.rows_affected())
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_all_user_api_tokens(pool: &PgPool, user_id: &str) -> Result<u64> {
    sqlx::query!("DELETE FROM api_tokens WHERE user_id = $1", user_id)
        .execute(pool)
        .await
        .map_err(Into::into)
        .map(|i| i.rows_affected())
}

#[instrument(skip(pool), ret, err)]
pub async fn update_api_token(
    pool: &PgPool,
    id: &str,
    data: &InternalUpdateApiToken,
    user_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "UPDATE api_tokens SET token = COALESCE($1, token), note = COALESCE($2, note), expires_at = COALESCE($3, expires_at) WHERE id = $4 AND user_id = $5",
        data.token,
        data.note,
        data.expires_at,
        id,
        user_id
    )
        .execute(pool)
        .await
        .map_err(Into::into)
        .map(|i| i.rows_affected())
}

#[instrument(skip(pool), ret, err)]
pub async fn get_user_api_keys(pool: &PgPool, user_id: &str) -> Result<Vec<ApiToken>> {
    sqlx::query_as!(
        ApiToken,
        r#"SELECT id, created_at, updated_at, note, expires_at FROM api_tokens WHERE user_id = $1 ORDER BY created_at DESC"#,
        user_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_api_token_from_id(pool: &PgPool, id: &str) -> Result<Option<GetApiToken>> {
    sqlx::query_as!(
        GetApiToken,
        r#"SELECT token, user_id FROM api_tokens WHERE id = $1"#,
        id
    )
    .fetch_optional(pool)
    .await
}
