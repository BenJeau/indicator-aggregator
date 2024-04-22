use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use database::{logic::users, PgPool};

use crate::Result;

/// Get list of users
#[utoipa::path(
    get,
    path = "/users",
    tag = "users",
    responses(
        (status = 200, description = "List of users", body = [UserWithNumLogs])
    )
)]
pub async fn get_users(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let users = users::get_users(&pool).await?;

    Ok(Json(users))
}

/// Get logs for a specific user by ID
#[utoipa::path(
    get,
    path = "/users/{id}/logs",
    tag = "users",
    responses(
        (status = 200, description = "List of logs", body = [DbUserLog])
    )
)]
pub async fn get_user_logs(
    State(pool): State<PgPool>,
    Path(user_id): Path<String>,
) -> Result<impl IntoResponse> {
    let logs = users::get_user_logs(&pool, &user_id).await?;

    Ok(Json(logs))
}

/// Get a specific user by ID
#[utoipa::path(
    get,
    path = "/users/{id}",
    tag = "users",
    responses(
        (status = 200, description = "User retrieved successfully", body = User),
        (status = 404, description = "User not found"),
    ),
    params(
        ("id" = String, Path, description = "User database ID"),
    )
)]
pub async fn get_user(
    State(pool): State<PgPool>,
    Path(user_id): Path<String>,
) -> Result<impl IntoResponse> {
    let user = users::get_user(&pool, &user_id).await?;

    if let Some(user) = user {
        Ok(Json(user).into_response())
    } else {
        Ok(StatusCode::NOT_FOUND.into_response())
    }
}
