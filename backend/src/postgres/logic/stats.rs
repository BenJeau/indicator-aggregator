use sqlx::PgPool;
use tracing::instrument;

use crate::{
    postgres::schemas::stats::{Count, CountPerId},
    Result,
};

#[instrument(skip(pool), ret, err)]
pub async fn count(pool: &PgPool) -> Result<Count> {
    sqlx::query_as!(
        Count,
        r#"
        SELECT
            (SELECT count(*) FROM requests)::int as "history!",
            (SELECT count(*)::int FROM requests WHERE created_at > NOW() - INTERVAL '24 hours') as "history_last_24hrs!",
            (SELECT count(*) FROM providers)::int as "providers!",
            (SELECT count(*)::int FROM providers WHERE enabled)::int as "enabled_providers!",
            (SELECT count(*) FROM sources)::int as "sources!",
            (SELECT count(*)::int FROM sources WHERE enabled)::int as "enabled_sources!",
            (SELECT count(*) FROM ignore_lists)::int as "ignore_lists!",
            (SELECT count(*)::int FROM ignore_lists WHERE enabled)::int as "enabled_ignore_lists!"
        "#
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn requests_per_source_last_day(pool: &PgPool) -> Result<Vec<CountPerId>> {
    sqlx::query_as!(
        CountPerId,
        r#"SELECT count(*)::int as "count!", source_id as "id" FROM source_requests WHERE created_at >= NOW() - INTERVAL '24 hours' GROUP BY source_id;"#
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn requests_per_provider_last_day(pool: &PgPool) -> Result<Vec<CountPerId>> {
    sqlx::query_as!(
        CountPerId,
        r#"SELECT count(*)::INT AS "count!", provider_id AS "id" FROM source_requests INNER JOIN sources ON sources.id = source_id WHERE source_requests.created_at >= NOW() - INTERVAL '24 hours' GROUP BY provider_id;"#
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}
