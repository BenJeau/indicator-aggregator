use sqlx::PgPool;
use tracing::instrument;

use crate::{postgres::schemas::stats::Count, Result};

#[instrument(skip(pool), ret, err)]
pub async fn count(pool: &PgPool) -> Result<Count> {
    sqlx::query_as!(
        Count,
        r#"
        SELECT
            (SELECT count(*) FROM requests)::int as "history!",
            (SELECT count(*) FROM providers)::int as "providers!",
            (SELECT count(*) FROM sources)::int as "sources!",
            (SELECT count(*) FROM ignore_lists)::int as "ignore_lists!"
        "#
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}
