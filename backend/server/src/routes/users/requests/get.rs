use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::{logic::requests, PgPool};

use crate::Result;

/// Get the requests made by a specific user
#[utoipa::path(
    get,
    path = "/users/{id}/requests",
    tag = "users",
    responses(
        (status = 200, description = "User's requests retrieved successfully", body = [Request]),
    ),
    params(
        ("id" = String, Path, description = "User database ID"),
    )
)]
pub async fn get_user_requests(
    State(pool): State<PgPool>,
    Path(user_id): Path<String>,
) -> Result<impl IntoResponse> {
    let requests = requests::get_user_requests(&pool, &user_id).await?;

    Ok(Json(requests))
}
