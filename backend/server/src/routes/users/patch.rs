use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use database::{
    logic::users,
    schemas::users::{UpdateUser, User},
    PgPool,
};

use crate::Result;

/// Update a user by ID
#[utoipa::path(
    patch,
    path = "/users/{id}",
    tag = "users",
    responses(
        (status = 204, description = "User updated successfully"),
        (status = 404, description = "User not found"),
    ),
    params(
        ("id" = String, Path, description = "User database ID"),
    ),
    request_body(
        description = "Fields to update",
        content_type = "application/json",
        content = UpdateUser
    )
)]
pub async fn update_user(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(user_id): Path<String>,
    Json(update_user): Json<UpdateUser>,
) -> Result<impl IntoResponse> {
    users::update_user(&pool, &user_id, &update_user, &user.id).await?;

    Ok(StatusCode::NO_CONTENT)
}
