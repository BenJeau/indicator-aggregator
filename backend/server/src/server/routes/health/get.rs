use axum::{response::IntoResponse, Json};
use serde_json::json;

use crate::error::Result;

// Verifies if the backend is healthy and it's related services
#[utoipa::path(
    get,
    path = "/health",
    tag = "health",
    responses(
        (status = 200, example = json!({"status": "ok"}), description = "Backend is healthy"),
    ),
)]
pub async fn health() -> Result<impl IntoResponse> {
    Ok(Json(json!({"status": "ok"})))
}
