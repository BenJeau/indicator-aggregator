use sqlx::{PgExecutor, PgPool, Result};
use tracing::instrument;
use uuid::Uuid;

use crate::schemas::{
    ignore_lists::IgnoreList,
    providers::{CreateProvider, PatchProvider, ProviderWithNumSources},
};

#[instrument(skip(pool), ret, err)]
pub async fn get_providers(pool: &PgPool) -> Result<Vec<ProviderWithNumSources>> {
    sqlx::query_as!(ProviderWithNumSources, r#"SELECT providers.*, count(sources.id)::INT as "num_sources!" FROM providers LEFT JOIN sources ON providers.id = sources.provider_id GROUP BY providers.id ORDER BY providers.enabled DESC, providers.name"#)
        .fetch_all(pool)
        .await
        .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn create_provider(pool: &PgPool, provider: CreateProvider) -> Result<Uuid> {
    sqlx::query_scalar!(
        "INSERT INTO providers (name, description, url, favicon, tags, enabled) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        provider.name,
        provider.description,
        provider.url,
        provider.favicon,
        provider.tags as Option<Vec<String>>,
        provider.enabled
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_provider(pool: &PgPool, id: &Uuid) -> Result<Option<ProviderWithNumSources>> {
    let provider = sqlx::query_as!(ProviderWithNumSources, r#"SELECT providers.*, count(sources.id)::INT as "num_sources!" FROM providers LEFT JOIN sources ON providers.id = sources.provider_id WHERE providers.id = $1 GROUP BY providers.id"#, id)
        .fetch_optional(pool)
        .await?;

    Ok(provider)
}

#[instrument(skip(pool), ret, err)]
pub async fn patch_provider(pool: &PgPool, id: &Uuid, provider: PatchProvider) -> Result<u64> {
    sqlx::query!(
        "UPDATE providers SET name = COALESCE($1, name), description = COALESCE($2, description), url = COALESCE($3, url), favicon = COALESCE($4, favicon), tags = COALESCE($5, tags), enabled = COALESCE($6, enabled) WHERE id = $7",
        provider.name,
        provider.description,
        provider.url,
        provider.favicon,
        provider.tags as Option<Vec<String>>,
        provider.enabled,
        id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_provider(pool: &PgPool, id: &Uuid) -> Result<u64> {
    sqlx::query!("DELETE FROM providers WHERE id = $1", id)
        .execute(pool)
        .await
        .map(|i| i.rows_affected())
        .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_provider_ignore_lists(
    pool: &PgPool,
    provider_id: &Uuid,
) -> Result<Vec<IgnoreList>> {
    sqlx::query_as!(
        IgnoreList,
        "SELECT ignore_lists.* FROM ignore_lists INNER JOIN provider_ignore_lists ON provider_ignore_lists.ignore_list_id = ignore_lists.id WHERE provider_ignore_lists.source_provider_id = $1",
        provider_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn add_provider_ignore_lists<'e>(
    pool: impl PgExecutor<'e>,
    source_provider_id: &Uuid,
    ignore_list_ids: &[Uuid],
) -> Result<u64> {
    sqlx::query!(
        "INSERT INTO provider_ignore_lists (ignore_list_id, source_provider_id) VALUES (UNNEST($1::UUID[]), $2)",
        ignore_list_ids,
        source_provider_id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_provider_ignore_lists(
    pool: &PgPool,
    source_provider_id: &Uuid,
    ignore_list_ids: &[Uuid],
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
    source_provider_id: &Uuid,
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
    source_provider_id: &Uuid,
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
    source_provider_id: &Uuid,
    source_ids: &[Uuid],
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
