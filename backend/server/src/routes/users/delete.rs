use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use database::{logic::api_tokens, PgPool};

use crate::Result;

/// Delete all API tokens for a user
#[utoipa::path(
    delete,
    path = "/users/{id}/apiTokens",
    tag = "apiTokens",
    responses(
        (status = 204, description = "User's API tokens deleted successfully"),
        (status = 404, description = "User not found"),
    ),
    params(
        ("id" = String, Path, description = "User database ID"),
    )
)]
pub async fn delete_api_tokens(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse> {
    let num_affected = api_tokens::delete_all_user_api_tokens(&pool, &id).await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
