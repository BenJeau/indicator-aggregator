use axum::{extract::State, response::IntoResponse, Json};
use sqlx::PgPool;

use crate::{
    postgres::{logic::sources, schemas::sources::CreateSource},
    Result,
};

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
    let source_id = sources::create_source(&pool, source).await?;

    Ok(source_id.to_string())
}
