use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use database::{logic::providers, PgPool};

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
        ("id" = String, Path, description = "Provider database ID"),
    ),
    request_body(
        description = "Source database IDs",
        content_type = "application/json",
        content = Vec<String>
    )
)]
pub async fn put_provider_sources(
    State(pool): State<PgPool>,
    Path(provider_id): Path<String>,
    Json(source_ids): Json<Vec<String>>,
) -> Result<impl IntoResponse> {
    let mut transaction = pool.begin().await?;

    // TODO: don't unset and set everything... then set the updated_user_id accordingly
    providers::unset_all_provider_sources(&mut *transaction, &provider_id).await?;
    providers::set_all_provider_sources(&mut *transaction, &provider_id, &source_ids).await?;

    transaction.commit().await?;

    Ok(StatusCode::CREATED)
}
