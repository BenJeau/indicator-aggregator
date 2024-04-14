use sqlx::{PgExecutor, PgPool, Result};
use tracing::instrument;

use crate::schemas::{
    ignore_lists::IgnoreList,
    indicators::Indicator,
    sources::{CreateSource, InternalRequest, Source, SourceCode, SourceKind, UpdateSource},
};

#[instrument(skip(pool), err)]
pub async fn get_provider_sources(pool: &PgPool, provider_id: &str) -> Result<Vec<Source>> {
    sqlx::query_as!(
        Source,
        r#"SELECT id,
created_at,
updated_at,
name,
description,
url,
favicon,
tags,
enabled,
supported_indicators,
disabled_indicators,
task_enabled,
task_interval,
config,
config_values,
limit_enabled,
limit_count,
limit_interval,
cache_enabled,
cache_interval,
provider_id,
kind as "kind: _",
source_code FROM sources WHERE provider_id = $1 ORDER BY name"#,
        provider_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), err)]
pub async fn get_sources_for_internal_request(
    pool: &PgPool,
    indicator: &Indicator,
    source_ids: &[String],
) -> Result<Vec<InternalRequest>> {
    sqlx::query_as!(
        InternalRequest,
        r#"
SELECT
sources.id as source_id,
sources.name as source_name,
sources.kind as "source_kind: _",
sources.enabled as source_enabled,
sources.url as source_url,
sources.favicon as source_favicon,
sources.supported_indicators as source_supported_indicators,
sources.disabled_indicators as source_disabled_indicators,
sources.cache_enabled as source_cache_enabled,
sources.cache_interval as source_cache_interval,
providers.id as "provider_id: Option<String>",
providers.enabled as "provider_enabled: Option<bool>",
COALESCE(array_agg(DISTINCT source_secrets.id) FILTER (WHERE source_secrets.id IS NOT NULL), '{}') AS "missing_source_secrets!",
COALESCE(array_agg(DISTINCT ignore_list_entries.ignore_list_id) FILTER (WHERE ignore_list_entries.ignore_list_id IS NOT NULL), '{}') AS "within_ignore_lists!"
FROM sources
LEFT JOIN providers ON providers.id = sources.provider_id
LEFT JOIN source_secrets ON source_secrets.source_id = sources.id AND source_secrets.required = TRUE AND source_secrets.secret_id IS NULL
LEFT JOIN source_ignore_lists ON source_ignore_lists.source_id = sources.id
LEFT JOIN ignore_lists ON ignore_lists.id = source_ignore_lists.ignore_list_id OR ignore_lists."global" = TRUE
LEFT JOIN ignore_list_entries on ignore_lists.id = ignore_list_entries.ignore_list_id AND ignore_list_entries.indicator_kind = $1 AND ignore_list_entries.data LIKE '%' || $2 || '%'
WHERE CARDINALITY($3::TEXT[]) = 0 OR sources.id = ANY($3::TEXT[])
GROUP BY sources.id, providers.id;
"#,
        indicator.db_kind(),
        indicator.data,
        source_ids,
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), err)]
pub async fn get_sources(pool: &PgPool) -> Result<Vec<Source>> {
    sqlx::query_as!(
        Source,
        r#"SELECT id,
created_at,
updated_at,
name,
description,
url,
favicon,
tags,
enabled,
supported_indicators,
disabled_indicators,
task_enabled,
task_interval,
config,
config_values,
limit_enabled,
limit_count,
limit_interval,
cache_enabled,
cache_interval,
provider_id,
kind as "kind: _",
source_code FROM sources ORDER BY name"#
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), err)]
pub async fn get_supported_enabled_sources(
    pool: &PgPool,
    indicator_kind: &str,
) -> Result<Vec<Source>> {
    sqlx::query_as!(
        Source,
        r#"SELECT sources.id,
sources.created_at,
sources.updated_at,
sources.name,
sources.description,
sources.url,
sources.favicon,
sources.tags,
sources.enabled,
sources.supported_indicators,
sources.disabled_indicators,
sources.task_enabled,
sources.task_interval,
sources.config,
sources.config_values,
sources.limit_enabled,
sources.limit_count,
sources.limit_interval,
sources.cache_enabled,
sources.cache_interval,
sources.provider_id,
sources.kind as "kind: _",
sources.source_code
FROM sources
LEFT JOIN providers ON providers.id = sources.provider_id
WHERE $1 = ANY(sources.supported_indicators) AND NOT ($1 = ANY(sources.disabled_indicators)) AND sources.enabled = TRUE AND (providers IS NULL OR providers.enabled = TRUE)
ORDER BY name"#,
    indicator_kind
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), err)]
pub async fn get_unsupported_indicator_sources(
    pool: &PgPool,
    indicator_kind: &str,
) -> Result<Vec<String>> {
    sqlx::query_scalar!(
        r#"SELECT name FROM sources WHERE NOT ($1 = ANY(supported_indicators))"#,
        indicator_kind
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), err)]
pub async fn get_disabled_sources(pool: &PgPool) -> Result<Vec<String>> {
    sqlx::query_scalar!(
        r#"SELECT sources.name FROM sources LEFT JOIN providers ON providers.id = sources.provider_id WHERE sources.enabled = FALSE OR (providers IS NULL OR providers.enabled = FALSE) GROUP BY sources.name"#,
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), err)]
pub async fn get_disabled_indicator_sources(
    pool: &PgPool,
    indicator_kind: &str,
) -> Result<Vec<String>> {
    sqlx::query_scalar!(
        r#"SELECT name FROM sources WHERE ($1 = ANY(disabled_indicators))"#,
        indicator_kind
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), err)]
pub async fn get_source(pool: &PgPool, id: &str) -> Result<Source> {
    sqlx::query_as!(
        Source,
        r#"SELECT id,
created_at,
updated_at,
name,
description,
url,
favicon,
tags,
enabled,
supported_indicators,
disabled_indicators,
task_enabled,
task_interval,
config,
config_values,
limit_enabled,
limit_count,
limit_interval,
cache_enabled,
cache_interval,
provider_id,
kind as "kind: _",
source_code
FROM sources WHERE id = $1"#,
        id
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), err)]
pub async fn get_source_ignore_lists(pool: &PgPool, source_id: &str) -> Result<Vec<IgnoreList>> {
    sqlx::query_as!(
        IgnoreList,
        "SELECT ignore_lists.* FROM ignore_lists INNER JOIN source_ignore_lists ON source_ignore_lists.ignore_list_id = ignore_lists.id WHERE source_ignore_lists.source_id = $1",
        source_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), err, ret)]
pub async fn add_source_ignore_lists<'e>(
    pool: impl PgExecutor<'e>,
    source_id: &str,
    ignore_list_ids: &[String],
) -> Result<u64> {
    sqlx::query!(
        "INSERT INTO source_ignore_lists (ignore_list_id, source_id) VALUES (UNNEST($1::TEXT[]), $2)",
        ignore_list_ids,
        source_id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), err, ret)]
pub async fn delete_source_ignore_lists(
    pool: &PgPool,
    source_id: &str,
    ignore_list_ids: &[String],
) -> Result<u64> {
    sqlx::query!(
        "DELETE FROM source_ignore_lists WHERE ignore_list_id = ANY($1) AND source_id = $2",
        ignore_list_ids,
        source_id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), err, ret)]
pub async fn delete_all_source_ignore_lists<'e>(
    pool: impl PgExecutor<'e>,
    source_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "DELETE FROM source_ignore_lists WHERE source_id = $1",
        source_id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}
#[instrument(skip(pool), err, ret)]
pub async fn delete_source(pool: &PgPool, id: &str) -> Result<u64> {
    sqlx::query!("DELETE FROM sources WHERE id = $1", id)
        .execute(pool)
        .await
        .map(|i| i.rows_affected())
        .map_err(Into::into)
}

#[instrument(skip(pool), err, ret)]
pub async fn create_source(pool: &PgPool, data: &CreateSource) -> Result<String> {
    sqlx::query_scalar!(
        r#"
INSERT INTO sources (name, description, url, favicon, tags, enabled, supported_indicators, disabled_indicators, task_enabled, task_interval, config, config_values, limit_count, limit_interval, provider_id, kind, source_code, cache_enabled, cache_interval)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
RETURNING id"#,
        data.name,
        data.description,
        data.url,
        data.favicon,
        &data.tags,
        data.enabled,
        &data.supported_indicators,
        &data.disabled_indicators,
        data.task_enabled,
        data.task_interval,
        &data.config,
        &data.config_values,
        data.limit_count,
        data.limit_interval,
        data.provider_id,
        &data.kind as &SourceKind,
        data.source_code,
        data.cache_enabled,
        data.cache_interval
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), err, ret)]
pub async fn update_source(pool: &PgPool, id: &str, data: UpdateSource) -> Result<u64> {
    sqlx::query!(
        r#"UPDATE sources SET
name = COALESCE($1, name),
description = COALESCE($2, description),
url = COALESCE($3, url),
favicon = COALESCE($4, favicon),
tags = COALESCE($5, tags),
enabled = COALESCE($6, enabled),
supported_indicators = COALESCE($7, supported_indicators),
disabled_indicators = COALESCE($8, disabled_indicators),
task_enabled = COALESCE($9, task_enabled),
task_interval = COALESCE($10, task_interval),
config = COALESCE($11, config),
config_values = COALESCE($12, config_values),
limit_enabled = COALESCE($13, limit_enabled),
limit_count = COALESCE($14, limit_count),
limit_interval = COALESCE($15, limit_interval),
provider_id = COALESCE($16, provider_id),
kind = COALESCE($17, kind),
source_code = COALESCE($18, source_code),
cache_enabled = COALESCE($19, cache_enabled),
cache_interval = COALESCE($20, cache_interval)
WHERE id = $21"#,
        data.name,
        data.description,
        data.url,
        data.favicon,
        data.tags.as_ref() as Option<&Vec<String>>,
        data.enabled,
        data.supported_indicators.as_ref() as Option<&Vec<String>>,
        data.disabled_indicators.as_ref() as Option<&Vec<String>>,
        data.task_enabled,
        data.task_interval,
        data.config.as_ref() as Option<&Vec<serde_json::Value>>,
        data.config_values.as_ref() as Option<&Vec<serde_json::Value>>,
        data.limit_enabled,
        data.limit_count,
        data.limit_interval,
        data.provider_id,
        data.kind as Option<SourceKind>,
        data.source_code,
        data.cache_enabled,
        data.cache_interval,
        id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), err, ret)]
pub async fn get_source_code_by_kind(pool: &PgPool, kind: &SourceKind) -> Result<Vec<SourceCode>> {
    sqlx::query_as!(
        SourceCode,
        r#"SELECT id, source_code FROM sources WHERE kind = $1"#,
        kind as &SourceKind
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}
