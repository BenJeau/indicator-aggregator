use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use postgres::logic::providers;
use postgres::PgPool;
use uuid::Uuid;

use crate::Result;

/// Link sources to a specific source provider
#[utoipa::path(
    put,
    path = "/providers/{id}/sources",
    tag = "providers",
    responses(
        (status = 201, description = "Provider sources linked successfully"),
    ),
    params(
        ("id" = Uuid, Path, description = "Provider database ID"),
    ),
    request_body(
        description = "Source database IDs",
        content_type = "application/json",
        content = Vec<Uuid>
    )
)]
pub async fn put_provider_sources(
    State(pool): State<PgPool>,
    Path(provider_id): Path<Uuid>,
    Json(source_ids): Json<Vec<Uuid>>,
) -> Result<impl IntoResponse> {
    let mut transaction = pool.begin().await?;

    providers::unset_all_provider_sources(&mut *transaction, &provider_id).await?;
    providers::set_all_provider_sources(&mut *transaction, &provider_id, &source_ids).await?;

    transaction.commit().await?;

    Ok(StatusCode::CREATED)
}
