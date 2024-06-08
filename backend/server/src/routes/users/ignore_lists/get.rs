use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::{logic::ignore_lists, PgPool};

use crate::Result;

/// Get the ignore lists created by a specific user
#[utoipa::path(
    get,
    path = "/users/{id}/ignoreLists",
    tag = "users",
    responses(
        (status = 200, description = "User's ignore lists retrieved successfully", body = [IgnoreList]),
    ),
    params(
        ("id" = String, Path, description = "User database ID"),
    )
)]
pub async fn get_user_ignore_lists(
    State(pool): State<PgPool>,
    Path(user_id): Path<String>,
) -> Result<impl IntoResponse> {
    let ignore_lists = ignore_lists::get_user_ignore_lists(&pool, &user_id).await?;

    Ok(Json(ignore_lists))
}
