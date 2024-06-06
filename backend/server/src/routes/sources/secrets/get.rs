use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use database::{logic::secrets, PgPool};

use crate::Result;

/// Get the source secrets for a specific source
#[utoipa::path(
    get,
    path = "/sources/{id}/secrets",
    tag = "sources",
    responses(
        (status = 200, description = "Source secrets retrieved successfully", body = [SourceSecret]),
        (status = 404, description = "Source not found"),
    ),
    params(
        ("id" = String, Path, description = "Source database ID"),
    )
)]
pub async fn get_source_secrets(
    State(pool): State<PgPool>,
    Path(source_id): Path<String>,
) -> Result<impl IntoResponse> {
    let secrets = secrets::get_source_secrets(&pool, &source_id).await?;

    Ok(Json(secrets))
}
