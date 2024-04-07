use axum::{extract::State, response::IntoResponse, Json};
use postgres::PgPool;
use postgres::{
    logic::sources,
    schemas::sources::{CreateSource, SourceKind},
};

use crate::{runners::send_update_request, Result};

/// Create a new source
#[utoipa::path(
    post,
    path = "/sources",
    tag = "sources",
    responses(
        (status = 200, description = "Source created successfully", body = String),
    ),
    request_body(
        description = "Source to create",
        content_type = "application/json",
        content = CreateSource
    )
)]
pub async fn create_source(
    State(pool): State<PgPool>,
    Json(source): Json<CreateSource>,
) -> Result<impl IntoResponse> {
    let source_id = sources::create_source(&pool, &source).await?;

    if source.kind != SourceKind::System {
        if let Some(source_code) = source.source_code {
            send_update_request(&pool, source.kind, &source_id, &source_code).await?;
        }
    }

    Ok(source_id.to_string())
}
