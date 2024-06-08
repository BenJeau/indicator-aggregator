use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::{logic::providers, PgPool};

use crate::Result;

/// Get the providers created by a specific user
#[utoipa::path(
    get,
    path = "/users/{id}/providers",
    tag = "users",
    responses(
        (status = 200, description = "User's providers retrieved successfully", body = [Provider]),
    ),
    params(
        ("id" = String, Path, description = "User database ID"),
    )
)]
pub async fn get_user_providers(
    State(pool): State<PgPool>,
    Path(user_id): Path<String>,
) -> Result<impl IntoResponse> {
    let providers = providers::get_user_providers(&pool, &user_id).await?;

    Ok(Json(providers))
}
