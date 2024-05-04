use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use database::{
    logic::api_tokens,
    schemas::{api_tokens::UpdateApiToken, users::User},
    PgPool,
};

use crate::{config::Config, Result};

/// Update an existing API token
#[utoipa::path(patch, path = "/apiTokens/{id}", tag = "apiTokens")]
pub async fn update_api_tokens(
    State(pool): State<PgPool>,
    State(config): State<Config>,
    Extension(user): Extension<User>,
    Path(id): Path<String>,
    Json(data): Json<UpdateApiToken>,
) -> Result<impl IntoResponse> {
    let num_affected = api_tokens::update_api_token(
        &pool,
        &id,
        &data.into(),
        &user.id,
        &config.encryption.db_key,
    )
    .await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}