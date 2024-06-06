use axum::{extract::State, response::IntoResponse, Extension, Json};
use database::{
    logic::sources,
    schemas::{
        sources::{CreateSource, SourceKind},
        users::User,
    },
    PgPool,
};

use crate::{runners::send_update_request, Result};

/// Create a new source
#[utoipa::path(
    post,
    path = "/sources",
    tag = "sources",
    responses(
        (status = 200, description = "Source created successfully", body = IdSlug),
    ),
    request_body(
        description = "Source to create",
        content_type = "application/json",
        content = CreateSource
    )
)]
pub async fn create_source(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Json(source): Json<CreateSource>,
) -> Result<impl IntoResponse> {
    let created_source = sources::create_source(&pool, &source, &user.id).await?;

    if source.kind != SourceKind::System {
        if let Some(source_code) = source.source_code {
            send_update_request(&pool, source.kind, &created_source.id, &source_code).await?;
        }
    }

    Ok(Json(created_source))
}
