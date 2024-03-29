use axum::{extract::State, response::IntoResponse, Json};
use sqlx::PgPool;

use crate::{postgres::logic::stats, Result};

#[utoipa::path(
    get,
    tag = "stats",
    path = "/stats/count",
    responses(
        (status = 200, description = "Count of various items", body = [Count])
    )
)]
pub async fn count(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let count = stats::count(&pool).await?;

    Ok(Json(count))
}
