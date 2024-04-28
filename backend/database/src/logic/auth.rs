use sqlx::PgPool;
use tracing::instrument;

use crate::schemas::auth::{CreateLoginRequest, LoginRequest};

#[instrument(skip(pool), ret, err)]
pub async fn create_login_request(
    pool: &PgPool,
    request: CreateLoginRequest,
) -> sqlx::Result<String> {
    sqlx::query_scalar!(
        r#"
INSERT INTO login_requests (nonce, state_nonce, provider, ip_address, user_agent, browser_state, redirect_uri)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id;
        "#,
        request.nonce,
        request.state_nonce,
        request.provider,
        request.ip_address,
        request.user_agent,
        request.browser_state,
        request.redirect_uri,
    )
    .fetch_one(pool)
    .await
}

#[instrument(skip(pool), ret, err)]
pub async fn get_login_request(pool: &PgPool, id: &str) -> sqlx::Result<Option<LoginRequest>> {
    sqlx::query_as!(
        LoginRequest,
        r#"
SELECT id, created_at, updated_at, nonce, state_nonce, provider, ip_address, user_agent, browser_state, redirect_uri
FROM login_requests
WHERE id = $1;
        "#,
        id,
    )
    .fetch_optional(pool)
    .await
}

#[instrument(skip(pool), ret, err)]
pub async fn set_user_id_for_login_request(
    pool: &PgPool,
    id: &str,
    user_id: &str,
) -> sqlx::Result<()> {
    sqlx::query!(
        r#"
UPDATE login_requests
SET user_id = $1
WHERE id = $2;
        "#,
        user_id,
        id,
    )
    .execute(pool)
    .await?;

    Ok(())
}
