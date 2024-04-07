use axum::{extract::State, response::IntoResponse, Json};
use database::logic::notifications;
use database::PgPool;

use crate::Result;

/// Get all notifications from the service related to the configuration of the various aspects of the service
#[utoipa::path(
    get,
    path = "/notifications",
    tag = "notifications",
    responses(
        (status = 200, description = "Notifications retrieved successfully", body = Vec<NotificationKind>),
    ),
)]
pub async fn get_notifications(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let count = notifications::get_sources_without_secrets_set(&pool).await?;

    Ok(Json(count))
}
