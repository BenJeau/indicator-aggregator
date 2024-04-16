use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use database::logic::secrets;
use database::PgPool;

use crate::Result;

/// Delete a secret by its ID
#[utoipa::path(
    delete,
    path = "/secrets/{id}",
    tag = "secrets",
    responses(
        (status = 204, description = "Secret deleted successfully"),
        (status = 404, description = "Secret not found"),
    ),
    params(
        ("id" = String, Path, description = "Secret database ID"),
    )
)]
pub async fn delete_secret(
    State(pool): State<PgPool>,
    Path(secret_id): Path<String>,
) -> Result<impl IntoResponse> {
    let num_affected = secrets::delete_secret(&pool, &secret_id).await?;

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
