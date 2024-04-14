use sqlx::{PgExecutor, PgPool, Result};
use tracing::instrument;

use crate::schemas::{
    ignore_lists::{
        CreateIgnoreList, CreateIngoreListEntry, IgnoreList, IgnoreListEntry, UpdateIgnoreList,
    },
    providers::ProviderWithNumSources,
    sources::Source,
};

#[instrument(skip(pool), ret, err)]
pub async fn create_list(pool: &PgPool, data: CreateIgnoreList) -> Result<String> {
    sqlx::query_scalar!(
        "INSERT INTO ignore_lists (name, description, enabled) VALUES ($1, $2, $3) RETURNING id",
        data.name,
        data.description,
        data.enabled
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn update_list(pool: &PgPool, id: &str, data: UpdateIgnoreList) -> Result<u64> {
    sqlx::query!(
        "UPDATE ignore_lists SET name = COALESCE($1, name), description = COALESCE($2, description), enabled = COALESCE($3, enabled), global = COALESCE($4, global) WHERE id = $5",
        data.name,
        data.description,
        data.enabled,
        data.global,
        id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_list(pool: &PgPool, list_id: &str) -> Result<u64> {
    sqlx::query!("DELETE FROM ignore_lists WHERE id = $1", list_id)
        .execute(pool)
        .await
        .map_err(Into::into)
        .map(|i| i.rows_affected())
}

#[instrument(skip(pool), ret, err)]
pub async fn get_list(pool: &PgPool, list_id: &str) -> Result<Option<IgnoreList>> {
    sqlx::query_as!(
        IgnoreList,
        "SELECT * FROM ignore_lists WHERE id = $1",
        list_id
    )
    .fetch_optional(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_global_lists(pool: &PgPool) -> Result<Vec<IgnoreList>> {
    sqlx::query_as!(IgnoreList, "SELECT * FROM ignore_lists WHERE global = TRUE")
        .fetch_all(pool)
        .await
        .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_lists(pool: &PgPool) -> Result<Vec<IgnoreList>> {
    sqlx::query_as!(IgnoreList, "SELECT * FROM ignore_lists")
        .fetch_all(pool)
        .await
        .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn bulk_delete_entries(
    pool: &PgPool,
    list_id: &str,
    entry_ids: &[String],
) -> Result<u64> {
    sqlx::query!(
        "DELETE FROM ignore_list_entries WHERE ignore_list_id = $1 AND id = ANY($2::TEXT[])",
        list_id,
        entry_ids
    )
    .execute(pool)
    .await
    .map_err(Into::into)
    .map(|i| i.rows_affected())
}

#[instrument(skip(pool), ret, err)]
pub async fn add_entries_to_list<'e>(
    pool: impl PgExecutor<'e>,
    list_id: &str,
    data: Vec<CreateIngoreListEntry>,
) -> Result<Vec<String>> {
    sqlx::query_scalar!(
        r#"INSERT INTO ignore_list_entries (data, indicator_kind, ignore_list_id) VALUES (UNNEST($1::TEXT[]), UNNEST($2::TEXT[]), $3) RETURNING id"#,
        &data.iter().map(|i| i.data.clone()).collect::<Vec<_>>(),
        &data.into_iter().map(|i| i.indicator_kind).collect::<Vec<_>>(),
        list_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_list_entries(pool: &PgPool, list_id: &str) -> Result<Vec<IgnoreListEntry>> {
    sqlx::query_as!(
        IgnoreListEntry,
        "SELECT * FROM ignore_list_entries WHERE ignore_list_id = $1",
        list_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_list_providers(
    pool: &PgPool,
    list_id: &str,
) -> Result<Vec<ProviderWithNumSources>> {
    sqlx::query_as!(
        ProviderWithNumSources,
        r#"SELECT providers.*, count(sources.id)::INT as "num_sources!"
FROM providers
INNER JOIN provider_ignore_lists ON provider_ignore_lists.source_provider_id = providers.id
LEFT JOIN sources ON providers.id = sources.provider_id
WHERE provider_ignore_lists.ignore_list_id = $1
GROUP BY providers.id
ORDER BY providers.enabled DESC, providers.name"#,
        list_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_list_sources(pool: &PgPool, list_id: &str) -> Result<Vec<Source>> {
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
INNER JOIN source_ignore_lists ON source_ignore_lists.source_id = sources.id
WHERE source_ignore_lists.ignore_list_id = $1"#,
        list_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_all_ignore_list_sources<'e>(
    pool: impl PgExecutor<'e>,
    ignore_list_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "DELETE FROM source_ignore_lists WHERE ignore_list_id = $1",
        ignore_list_id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn add_ignore_list_sources<'e>(
    pool: impl PgExecutor<'e>,
    ignore_list_id: &str,
    source_ids: &[String],
) -> Result<u64> {
    sqlx::query!(
        "INSERT INTO source_ignore_lists (ignore_list_id, source_id) VALUES ($1, UNNEST($2::TEXT[]))",
        ignore_list_id,
        source_ids
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_all_ignore_list_providers<'e>(
    pool: impl PgExecutor<'e>,
    ignore_list_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "DELETE FROM provider_ignore_lists WHERE ignore_list_id = $1",
        ignore_list_id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn add_ignore_list_providers<'e>(
    pool: impl PgExecutor<'e>,
    ignore_list_id: &str,
    provider_ids: &[String],
) -> Result<u64> {
    sqlx::query!(
        "INSERT INTO provider_ignore_lists (ignore_list_id, source_provider_id) VALUES ($1, UNNEST($2::TEXT[]))",
        ignore_list_id,
        provider_ids
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_all_ignore_list_entries<'e>(
    pool: impl PgExecutor<'e>,
    list_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "DELETE FROM ignore_list_entries WHERE ignore_list_id = $1",
        list_id,
    )
    .execute(pool)
    .await
    .map_err(Into::into)
    .map(|i| i.rows_affected())
}
