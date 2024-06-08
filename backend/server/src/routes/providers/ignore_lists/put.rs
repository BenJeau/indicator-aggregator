use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use database::{logic::providers, schemas::users::User, PgPool};

use crate::Result;

/// Replace the ignore lists of a specific provider
#[utoipa::path(
    put,
    path = "/providers/{id}/ignoreLists",
    tag = "providers",
    responses(
        (status = 201, description = "Provider ignore lists replaced successfully"),
    ),
    params(
        ("id" = String, Path, description = "Provider database ID"),
    ),
    request_body(
        description = "Ignore list database IDs",
        content_type = "application/json",
        content = Vec<String>
    )
)]
pub async fn put_provider_ignore_lists(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(provider_id): Path<String>,
    Json(ignore_list_ids): Json<Vec<String>>,
) -> Result<impl IntoResponse> {
    let mut transaction = pool.begin().await?;

    // TODO: don't unset and set everything... then set the updated_user_id accordingly
    providers::delete_all_provider_ignore_lists(&mut *transaction, &provider_id).await?;
    providers::add_provider_ignore_lists(
        &mut *transaction,
        &provider_id,
        &ignore_list_ids,
        &user.id,
    )
    .await?;

    transaction.commit().await?;

    Ok(StatusCode::CREATED)
}
