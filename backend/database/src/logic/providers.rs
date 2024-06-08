use sqlx::{PgExecutor, PgPool, Result};
use tracing::instrument;

use crate::{
    schemas::{
        ignore_lists::IgnoreList,
        providers::{CreateProvider, PatchProvider, Provider},
        IdSlug,
    },
    slug::slugify,
};

#[instrument(skip(pool), ret, err)]
pub async fn get_providers(pool: &PgPool) -> Result<Vec<Provider>> {
    sqlx::query_as!(
        Provider,
        r#"SELECT providers.*,
count(sources.id)::INT as "num_sources!"
FROM providers
LEFT JOIN sources ON providers.id = sources.provider_id
GROUP BY providers.id
ORDER BY providers.enabled DESC, providers.name"#
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_provider_id_from_slug(pool: &PgPool, slug: &str) -> Result<Option<String>> {
    sqlx::query_scalar!("SELECT id FROM providers WHERE slug = $1", slug)
        .fetch_optional(pool)
        .await
        .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn create_provider(
    pool: &PgPool,
    provider: CreateProvider,
    user_id: &str,
) -> Result<IdSlug> {
    sqlx::query_as!(
        IdSlug,
        "INSERT INTO providers (name, slug, description, url, favicon, tags, enabled, created_user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, slug",
        provider.name,
        slugify(&provider.name),
        provider.description,
        provider.url,
        provider.favicon,
        provider.tags as Option<Vec<String>>,
        provider.enabled,
        user_id
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_provider(pool: &PgPool, id: &str) -> Result<Option<Provider>> {
    let provider = sqlx::query_as!(
        Provider,
        r#"SELECT providers.*,
count(sources.id)::INT as "num_sources!"
FROM providers
LEFT JOIN sources ON providers.id = sources.provider_id
WHERE providers.id = $1
GROUP BY providers.id"#,
        id
    )
    .fetch_optional(pool)
    .await?;

    Ok(provider)
}

#[instrument(skip(pool), ret, err)]
pub async fn patch_provider(
    pool: &PgPool,
    id: &str,
    provider: PatchProvider,
    user_id: &str,
) -> Result<u64> {
    sqlx::query!(
        r#"UPDATE providers SET
name = COALESCE($1, name),
slug = COALESCE($2, slug),
description = COALESCE($3, description),
url = COALESCE($4, url),
favicon = COALESCE($5, favicon),
tags = COALESCE($6, tags),
enabled = COALESCE($7, enabled),
updated_user_id = $8
WHERE id = $9"#,
        provider.name,
        provider.name.as_ref().map(|n| slugify(&n)),
        provider.description,
        provider.url,
        provider.favicon,
        provider.tags as Option<Vec<String>>,
        provider.enabled,
        user_id,
        id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_provider(pool: &PgPool, id: &str) -> Result<u64> {
    sqlx::query!("DELETE FROM providers WHERE id = $1", id)
        .execute(pool)
        .await
        .map(|i| i.rows_affected())
        .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_provider_ignore_lists(
    pool: &PgPool,
    provider_id: &str,
) -> Result<Vec<IgnoreList>> {
    sqlx::query_as!(
        IgnoreList,
        r#"SELECT ignore_lists.*
FROM ignore_lists
INNER JOIN provider_ignore_lists ON provider_ignore_lists.ignore_list_id = ignore_lists.id
WHERE provider_ignore_lists.source_provider_id = $1"#,
        provider_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn add_provider_ignore_lists<'e>(
    pool: impl PgExecutor<'e>,
    source_provider_id: &str,
    ignore_list_ids: &[String],
    user_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "INSERT INTO provider_ignore_lists (ignore_list_id, source_provider_id, user_id) VALUES (UNNEST($1::TEXT[]), $2, $3)",
        ignore_list_ids,
        source_provider_id,
        user_id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_provider_ignore_lists(
    pool: &PgPool,
    source_provider_id: &str,
    ignore_list_ids: &[String],
) -> Result<u64> {
    sqlx::query!(
        "DELETE FROM provider_ignore_lists WHERE ignore_list_id = ANY($1) AND source_provider_id = $2",
        ignore_list_ids,
        source_provider_id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_all_provider_ignore_lists<'e>(
    pool: impl PgExecutor<'e>,
    source_provider_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "DELETE FROM provider_ignore_lists WHERE source_provider_id = $1",
        source_provider_id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn unset_all_provider_sources<'e>(
    pool: impl PgExecutor<'e>,
    source_provider_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "UPDATE sources SET provider_id = NULL WHERE provider_id = $1",
        source_provider_id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn set_all_provider_sources<'e>(
    pool: impl PgExecutor<'e>,
    source_provider_id: &str,
    source_ids: &[String],
) -> Result<u64> {
    sqlx::query!(
        "UPDATE sources SET provider_id = $1 WHERE id = ANY($2)",
        source_provider_id,
        source_ids
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_user_providers(pool: &PgPool, user_id: &str) -> Result<Vec<Provider>> {
    sqlx::query_as!(
        Provider,
        r#"SELECT providers.*,
count(sources.id)::INT as "num_sources!"
FROM providers
LEFT JOIN sources ON providers.id = sources.provider_id
WHERE providers.created_user_id = $1
GROUP BY providers.id
ORDER BY providers.enabled DESC, providers.name"#,
        user_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}
