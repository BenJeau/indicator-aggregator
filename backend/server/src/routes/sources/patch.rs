use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use database::{
    logic::sources,
    schemas::{
        sources::{SourceKind, UpdateSource},
        users::User,
    },
    PgPool,
};

use crate::{runners::send_update_request, Result};

/// Partially update a specific source by ID
#[utoipa::path(
    patch,
    path = "/sources/{id}",
    tag = "sources",
    responses(
        (status = 204, description = "Source updated successfully"),
        (status = 404, description = "Source not found"),
    ),
    params(
        ("id" = String, Path, description = "Source database ID"),
    ),
    request_body(
        description = "Fields to update",
        content_type = "application/json",
        content = UpdateSource
    )
)]
pub async fn patch_source(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(source_id): Path<String>,
    Json(source): Json<UpdateSource>,
) -> Result<impl IntoResponse> {
    let num_affected = sources::update_source(&pool, &source_id, source, &user.id).await?;

    let source = sources::get_source(&pool, &source_id).await?;

    if source.kind != SourceKind::System {
        if let Some(source_code) = source.source_code {
            send_update_request(&pool, source.kind, &source_id, &source_code).await?;
        }
    }

    if num_affected > 0 {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Ok(StatusCode::NOT_FOUND)
    }
}
