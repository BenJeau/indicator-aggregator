use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Extension, Json,
};
use database::{logic::ignore_lists, schemas::users::User, PgPool};

use crate::Result;

/// Updates the list of sources affected by an ignore list
#[utoipa::path(
    put,
    path = "/ignoreLists/{id}/providers",
    tag = "ignoreLists",
    responses(
        (status = 201, description = "Ignore list providers updated successfully"),
    ),
    params(
        ("id" = String, Path, description = "Ignore list database ID"),
    ),
    request_body(
        content_type = "application/json", content = Vec<String>, description = "List of provider database IDs"
    )
)]
pub async fn put_ignore_list_providers(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(ignore_list_id): Path<String>,
    Json(provider_ids): Json<Vec<String>>,
) -> Result<impl IntoResponse> {
    let mut transaction = pool.begin().await?;

    // TODO: don't unset and set everything... then set the updated_user_id accordingly
    ignore_lists::delete_all_ignore_list_providers(&mut *transaction, &ignore_list_id).await?;
    ignore_lists::add_ignore_list_providers(
        &mut *transaction,
        &ignore_list_id,
        &provider_ids,
        &user.id,
    )
    .await?;

    transaction.commit().await?;

    Ok(StatusCode::CREATED)
}
