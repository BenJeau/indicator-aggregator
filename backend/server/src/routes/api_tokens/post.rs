use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Extension, Json,
};
use database::{
    logic::api_tokens,
    schemas::{
        api_tokens::{CreateApiToken, InternalUpdateApiToken},
        users::User,
    },
    PgPool,
};
use reqwest::StatusCode;
use shared::crypto::{hash_password, Crypto};

use crate::{schemas::CreatedApiToken, Result};

/// Create an API token
#[utoipa::path(
    post,
    path = "/apiTokens",
    tag = "apiTokens",
    responses(
        (status = 200, description = "Database ID of the API token", body = CreatedApiToken)
    ),
    request_body(
        description = "API token to create", content_type = "application/json", content = CreateApiToken
    )
)]
pub async fn create_api_tokens(
    State(pool): State<PgPool>,
    State(crypto): State<Crypto>,
    Extension(user): Extension<User>,
    Json(data): Json<CreateApiToken>,
) -> Result<impl IntoResponse> {
    let token = crypto.generate_random_alphanumeric_string(32);
    let hashed_token = hash_password(&token)?;

    let id = api_tokens::update_or_create_api_token(&pool, data, &user.id, &hashed_token).await?;

    Ok(Json(CreatedApiToken { id, token }))
}

/// Regenerate the value of an existing API token
#[utoipa::path(
    post,
    path = "/apiTokens/{id}/regenerate",
    tag = "apiTokens",
    responses(
        (status = 200, description = "Token was generated and returned value is API token", body = String),
        (status = 404, description = "Token not found or not linked to user")
    ),
    params(
        ("id" = String, Path, description = "API token database ID"),
    )
)]
pub async fn regenerate_api_tokens(
    State(pool): State<PgPool>,
    State(crypto): State<Crypto>,
    Extension(user): Extension<User>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse> {
    let token = crypto.generate_random_alphanumeric_string(32);
    let hashed_token = hash_password(&token)?;

    let num_affected = api_tokens::update_api_token(
        &pool,
        &id,
        &InternalUpdateApiToken {
            token: Some(hashed_token),
            ..Default::default()
        },
        &user.id,
    )
    .await?;

    if num_affected > 0 {
        Ok((StatusCode::OK, token).into_response())
    } else {
        Ok(StatusCode::NOT_FOUND.into_response())
    }
}
