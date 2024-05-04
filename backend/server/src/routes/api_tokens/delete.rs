use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Extension,
};
use database::{logic::api_tokens, schemas::users::User, PgPool};

use crate::Result;

/// Delete an API token
#[utoipa::path(
    delete,
    path = "/apiTokens/{id}",
    tag = "apiTokens",
    responses(
        (status = 204, description = "API token deleted successfully"),
        (status = 404, description = "API token not found"),
    ),
    params(
        ("id" = String, Path, description = "API token database ID"),
    )
)]
pub async fn delete_api_tokens(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse> {
    let num_affected = api_tokens::delete_api_token(&pool, &id, &user.id).await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
