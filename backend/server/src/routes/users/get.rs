use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::{
    logic::{api_tokens, users},
    PgPool,
};

use crate::{Error, Result};

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
    ),
    params(
        ("id" = String, Path, description = "User database ID"),
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
    let user = users::get_user(&pool, &user_id)
        .await?
        .ok_or(Error::NotFound)?;

    Ok(Json(user))
}

/// Get list of API tokens for a user
#[utoipa::path(
    get,
    path = "/users/{id}/apiTokens",
    tag = "apiTokens",
    responses(
        (status = 200, description = "List of users' API tokens", body = [ApiToken])
    ),
    params(
        ("id" = String, Path, description = "User database ID"),
    )
)]
pub async fn get_user_api_tokens(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse> {
    let users = api_tokens::get_user_api_keys(&pool, &id).await?;

    Ok(Json(users))
}
