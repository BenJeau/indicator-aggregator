use shared::crypto::Crypto;
use sqlx::{FromRow, PgPool, Result};
use tracing::instrument;

use crate::schemas::api_tokens::{ApiToken, CreateApiToken, InternalUpdateApiToken};

#[instrument(skip_all, ret, err)]
pub async fn create_api_token(
    pool: &PgPool,
    data: CreateApiToken,
    user_id: &str,
    value: &[u8],
    db_secret: &str,
) -> Result<String> {
    sqlx::query_scalar!(
        "INSERT INTO api_tokens (user_id, note, expires_at, value) VALUES ($1, $2, $3, pgp_sym_encrypt_bytea($4, $5)) RETURNING id",
        user_id,
        data.note,
        data.expires_at,
        value,
        db_secret,
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
pub async fn update_api_token(
    pool: &PgPool,
    id: &str,
    data: &InternalUpdateApiToken,
    user_id: &str,
    db_secret: &str,
) -> Result<u64> {
    sqlx::query!(
        "UPDATE api_tokens SET value = COALESCE(pgp_sym_encrypt_bytea($1, $2), value), note = COALESCE($3, note), expires_at = COALESCE($4, expires_at) WHERE id = $5 AND user_id = $6",
        data.value,
        db_secret,
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
        r#"SELECT id, created_at, updated_at, note, expires_at FROM api_tokens WHERE user_id = $1"#,
        user_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[derive(FromRow, Debug)]
struct TempTest {
    pub value: Vec<u8>,
    pub user_id: String,
}

pub async fn get_user_id_from_token(
    pool: &PgPool,
    unencrypted_value: &str,
    db_secret: &str,
    crypto: Crypto,
) -> Result<Option<String>> {
    let api_tokens = sqlx::query_as!(
        TempTest,
        r#"SELECT pgp_sym_decrypt_bytea(value, $1) as "value!", user_id FROM api_tokens"#,
        db_secret
    )
    .fetch_all(pool)
    .await?;

    for api_token in api_tokens {
        let decoded_token = crypto.decrypt(&api_token.value).unwrap();

        if decoded_token == unencrypted_value {
            return Ok(Some(api_token.user_id));
        }
    }

    Ok(None)
}
