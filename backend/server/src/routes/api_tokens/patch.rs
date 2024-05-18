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

use crate::Result;

/// Update an existing API token
#[utoipa::path(
    patch,
    path = "/apiTokens/{id}",
    tag = "apiTokens",
    responses(
        (status = 204, description = "API token updated successfully"),
        (status = 404, description = "API token not found"),
    ),
    request_body(
        description = "Fields of the API token to update", content_type = "application/json", content = UpdateApiToken
    ),
    params(
        ("id" = String, Path, description = "API token database ID"),
    )
)]
pub async fn update_api_tokens(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(id): Path<String>,
    Json(data): Json<UpdateApiToken>,
) -> Result<impl IntoResponse> {
    let num_affected = api_tokens::update_api_token(&pool, &id, &data.into(), &user.id).await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
