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
use shared::crypto::Crypto;

use crate::{config::Config, Result};

/// Create an API token
#[utoipa::path(
    post,
    path = "/apiTokens",
    tag = "apiTokens",
    responses(
        (status = 200, description = "Database ID of the API token", body = String)
    )
)]
pub async fn create_api_tokens(
    State(pool): State<PgPool>,
    State(config): State<Config>,
    State(crypto): State<Crypto>,
    Extension(user): Extension<User>,
    Json(data): Json<CreateApiToken>,
) -> Result<impl IntoResponse> {
    let value = crypto.generate_random_string(32)?;
    let encrypted_value = crypto.encrypt(value)?;

    let id = api_tokens::create_api_token(
        &pool,
        data,
        &user.id,
        &encrypted_value,
        &config.encryption.db_key,
    )
    .await?;

    Ok(id)
}

/// Regenerate the value of an existing API token
#[utoipa::path(post, path = "/apiTokens/{id}/regenerate", tag = "apiTokens")]
pub async fn regenerate_api_tokens(
    State(pool): State<PgPool>,
    State(config): State<Config>,
    State(crypto): State<Crypto>,
    Extension(user): Extension<User>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse> {
    let value = crypto.generate_random_string(32)?;
    let encrypted_value = crypto.encrypt(value.clone())?;

    let num_affected = api_tokens::update_api_token(
        &pool,
        &id,
        &InternalUpdateApiToken {
            value: Some(encrypted_value),
            ..Default::default()
        },
        &user.id,
        &config.encryption.db_key,
    )
    .await?;

    if num_affected > 0 {
        Ok((StatusCode::OK, value).into_response())
    } else {
        Ok(StatusCode::NOT_FOUND.into_response())
    }
}
