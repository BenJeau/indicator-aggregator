use axum::{extract::State, response::IntoResponse, Json};
use database::PgPool;
use database::{logic::ignore_lists, schemas::ignore_lists::CreateIgnoreList};

use crate::Result;

/// Create a new ignore list
#[utoipa::path(
    post,
    path = "/ignoreLists",
    tag = "ignoreLists",
    responses(
        (status = 200, description = "Ignore list created successfully", body = String),
    ),
    params(CreateIgnoreList),
)]
pub async fn create_list(
    State(pool): State<PgPool>,
    Json(list): Json<CreateIgnoreList>,
) -> Result<impl IntoResponse> {
    let list_id = ignore_lists::create_list(&pool, list).await?;

    Ok(list_id.to_string())
}
