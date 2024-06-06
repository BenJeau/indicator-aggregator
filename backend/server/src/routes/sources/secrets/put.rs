use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use database::{
    logic::secrets,
    schemas::{secrets::CreateSourceSecret, users::User},
    PgPool,
};

use crate::Result;

/// Sets the source secrets for a specific source
#[utoipa::path(
    put,
    path = "/sources/{id}/secrets",
    tag = "sources",
    responses(
        (status = 201, description = "Source secrets set successfully"),
        (status = 404, description = "Source not found"),
    ),
    params(
        ("id" = String, Path, description = "Source database ID"),
    ),
    request_body(
        description = "The source secrets to set",
        content_type = "application/json",
        content = Vec<CreateSourceSecret>
    )
)]
pub async fn put_source_sources(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(source_id): Path<String>,
    Json(source_secrets): Json<Vec<CreateSourceSecret>>,
) -> Result<impl IntoResponse> {
    let mut transaction = pool.begin().await?;

    // TODO: don't unset and set everything... then set the updated_user_id accordingly
    secrets::delete_all_source_secrets(&mut *transaction, &source_id).await?;
    secrets::add_source_secrets(&mut *transaction, &source_id, &source_secrets, &user.id).await?;

    transaction.commit().await?;

    Ok(StatusCode::CREATED)
}
