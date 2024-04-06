use sqlx::PgPool;
use tracing::instrument;

use crate::{
    postgres::schemas::stats::{Count, CountPerHour, CountPerIdWrapper},
    Result,
};

#[instrument(skip(pool), ret, err)]
pub async fn count(pool: &PgPool) -> Result<Count> {
    sqlx::query_as!(
        Count,
        r#"SELECT
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
pub async fn requests_per_source_last_day(pool: &PgPool) -> Result<Vec<CountPerIdWrapper>> {
    sqlx::query_as(
        r#"SELECT
    COALESCE(
        json_agg(
            json_build_object(
                'id', id,
                'name', name,
                'count', count
            )
        ) FILTER (WHERE count > 0),
        '[]'
    ) AS data,
    time_window
FROM (
	SELECT
		sources.id,
		sources.name,
		COUNT(DISTINCT source_requests.request_id)::INT,
		time_window
	FROM 
	    generate_series(
		    date_trunc('hour', NOW()) - INTERVAL '24 hours', 
		    date_trunc('hour', NOW()), 
		    '1 hour'
		) AS time_window
	LEFT JOIN source_requests 
	LEFT JOIN sources ON sources.id = source_requests.source_id
	ON date_trunc('hour', source_requests.created_at) = time_window
	GROUP BY time_window, sources.id
) nested_data
GROUP BY time_window
ORDER BY time_window ASC;"#,
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn requests_per_provider_last_day(pool: &PgPool) -> Result<Vec<CountPerIdWrapper>> {
    sqlx::query_as(
        r#"SELECT
    COALESCE(
        json_agg(
            json_build_object(
                'id', id,
                'name', name,
                'count', count
            )
        ) filter (where count > 0),
        '[]'
    ) AS data,
    time_window
from (
	SELECT
		providers.id,
		providers.name,
		COUNT(DISTINCT source_requests.request_id)::INT,
		time_window
	FROM 
	    generate_series(
		    date_trunc('hour', NOW()) - INTERVAL '24 hours', 
		    date_trunc('hour', NOW()), 
		    '1 hour'
		) AS time_window
	LEFT JOIN source_requests 
	LEFT JOIN sources ON sources.id = source_requests.source_id
	LEFT JOIN providers ON providers.id = sources.provider_id
	ON date_trunc('hour', source_requests.created_at) = time_window
	GROUP BY time_window, providers.id
) nested_data
GROUP BY time_window
ORDER BY time_window ASC;"#,
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn requests_per_hour_last_day(pool: &PgPool) -> Result<Vec<CountPerHour>> {
    sqlx::query_as!(
        CountPerHour,
        r#"SELECT
	(COUNT(DISTINCT source_requests.request_id) FILTER (WHERE source_requests.cache_action IS NULL OR source_requests.cache_action != 'FROM_CACHE'))::INT AS "uncached_count!",
	(COUNT(DISTINCT source_requests.request_id) FILTER (WHERE source_requests.cache_action = 'FROM_CACHE'))::INT AS "cached_count!",
	time_window AS "time_window!"
FROM 
    generate_series(
	    date_trunc('hour', NOW()) - INTERVAL '24 hours', 
	    date_trunc('hour', NOW()), 
	    '1 hour'
	) AS time_window
LEFT JOIN source_requests 
ON date_trunc('hour', source_requests.created_at) = time_window
GROUP BY time_window
ORDER BY time_window ASC;"#
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn requests_per_kind_last_day(pool: &PgPool) -> Result<Vec<CountPerIdWrapper>> {
    sqlx::query_as(
        r#"SELECT
    COALESCE(
        json_agg(
            json_build_object(
            	'id', kind,
                'name', kind,
                'count', count
            )
        ) filter (where count > 0),
        '[]'
    ) AS data,
    time_window
from (
	SELECT
		requests.kind,
		COUNT(DISTINCT requests.id)::INT,
		time_window
	FROM 
	    generate_series(
		    date_trunc('hour', NOW()) - INTERVAL '24 hours', 
		    date_trunc('hour', NOW()), 
		    '1 hour'
		) AS time_window
	LEFT JOIN requests 
	ON date_trunc('hour', requests.created_at) = time_window
	GROUP BY time_window, requests.kind
) nested_data
GROUP BY time_window
ORDER BY time_window ASC;"#,
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}
