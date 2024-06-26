use sqlx::{PgExecutor, PgPool, Result};
use tracing::instrument;

use crate::{
    schemas::{
        ignore_lists::{
            CreateIgnoreList, CreateIngoreListEntry, IgnoreList, IgnoreListEntry, UpdateIgnoreList,
        },
        providers::Provider,
        sources::Source,
        IdSlug,
    },
    slug::slugify,
};

#[instrument(skip(pool), ret, err)]
pub async fn create_list(pool: &PgPool, data: CreateIgnoreList, user_id: &str) -> Result<IdSlug> {
    sqlx::query_as!(
        IdSlug,
        "INSERT INTO ignore_lists (name, slug, description, enabled, created_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, slug",
        data.name,
        slugify(&data.name),
        data.description,
        data.enabled,
        user_id
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn update_list(
    pool: &PgPool,
    id: &str,
    data: UpdateIgnoreList,
    user_id: &str,
) -> Result<u64> {
    sqlx::query!(
        r#"UPDATE ignore_lists SET
name = COALESCE($1, name),
slug = COALESCE($2, slug),
description = COALESCE($3, description),
enabled = COALESCE($4, enabled),
global = COALESCE($5, global),
updated_user_id = $6
WHERE id = $7"#,
        data.name,
        data.name.as_ref().map(|n| slugify(&n)),
        data.description,
        data.enabled,
        data.global,
        user_id,
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
pub async fn get_ignore_list_id_from_slug(pool: &PgPool, slug: &str) -> Result<Option<String>> {
    sqlx::query_scalar!("SELECT id FROM ignore_lists WHERE slug = $1", slug)
        .fetch_optional(pool)
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
    user_id: &str,
) -> Result<Vec<String>> {
    sqlx::query_scalar!(
        r#"INSERT INTO ignore_list_entries (data, indicator_kind, ignore_list_id, created_user_id) VALUES (UNNEST($1::TEXT[]), UNNEST($2::TEXT[]), $3, $4) RETURNING id"#,
        &data.iter().map(|i| i.data.clone()).collect::<Vec<_>>(),
        &data.into_iter().map(|i| i.indicator_kind).collect::<Vec<_>>(),
        list_id,
        user_id
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
pub async fn get_list_providers(pool: &PgPool, list_id: &str) -> Result<Vec<Provider>> {
    sqlx::query_as!(
        Provider,
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
sources.slug,
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
sources.source_code,
sources.created_user_id,
sources.updated_user_id
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
    user_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "INSERT INTO source_ignore_lists (ignore_list_id, source_id, user_id) VALUES ($1, UNNEST($2::TEXT[]), $3)",
        ignore_list_id,
        source_ids,
        user_id
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
    user_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "INSERT INTO provider_ignore_lists (ignore_list_id, source_provider_id, user_id) VALUES ($1, UNNEST($2::TEXT[]), $3)",
        ignore_list_id,
        provider_ids,
        user_id
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

#[instrument(skip(pool), ret, err)]
pub async fn get_user_ignore_lists(pool: &PgPool, user_id: &str) -> Result<Vec<IgnoreList>> {
    sqlx::query_as!(
        IgnoreList,
        r#"SELECT ignore_lists.* FROM ignore_lists WHERE created_user_id = $1"#,
        user_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}
