use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::{logic::sources, PgPool};

use crate::Result;

/// Get the sources made by a specific user
#[utoipa::path(
    get,
    path = "/users/{id}/sources",
    tag = "users",
    responses(
        (status = 200, description = "User's sources retrieved successfully", body = [Request]),
    ),
    params(
        ("id" = String, Path, description = "User database ID"),
    )
)]
pub async fn get_user_sources(
    State(pool): State<PgPool>,
    Path(user_id): Path<String>,
) -> Result<impl IntoResponse> {
    let sources = sources::get_user_sources(&pool, &user_id).await?;

    Ok(Json(sources))
}
