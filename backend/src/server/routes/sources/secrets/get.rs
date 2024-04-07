use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use postgres::logic::secrets;
use postgres::PgPool;
use uuid::Uuid;

use crate::Result;

/// Get the source secrets for a specific source
#[utoipa::path(
    get,
    path = "/sources/{id}/secrets",
    tag = "sources",
    responses(
        (status = 200, description = "Source secrets retrieved successfully", body = Vec<SourceSecret>),
        (status = 404, description = "Source not found"),
    ),
    params(
        ("id" = Uuid, Path, description = "Source database ID"),
    )
)]
pub async fn get_source_secrets(
    State(pool): State<PgPool>,
    Path(source_id): Path<Uuid>,
) -> Result<impl IntoResponse> {
    let secrets = secrets::get_source_secrets(&pool, &source_id).await?;

    Ok(Json(secrets))
}
