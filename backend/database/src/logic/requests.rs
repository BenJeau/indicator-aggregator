use sqlx::{PgPool, Result};
use tracing::instrument;

use crate::schemas::{
    indicators::Indicator,
    requests::{CreateSourceRequest, Request, SourceRequest},
};

#[instrument(skip(pool), ret, err)]
pub async fn create_request(pool: &PgPool, indicator: &Indicator, user_id: &str) -> Result<String> {
    let trace_id = shared::telemetry::Telemetry::get_trace_id();

    sqlx::query_scalar!(
        r#"
        INSERT INTO requests (data, kind, trace_id, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        "#,
        indicator.data,
        indicator.db_kind(),
        trace_id,
        user_id
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn create_source_request(
    pool: &PgPool,
    source_request: CreateSourceRequest,
) -> Result<String> {
    sqlx::query_scalar!(
        r#"
        INSERT INTO source_requests (
            started_at,
            ended_at,
            errors,
            data,
            cache_action,
            cache_expires_at,
            cache_cached_at,
            cache_key,
            request_id,
            source_id,
            source_name,
            source_slug,
            source_url,
            source_favicon
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
        "#,
        source_request.started_at,
        source_request.ended_at,
        &source_request.errors,
        source_request.data,
        source_request.cache_action,
        source_request.cache_expires_at,
        source_request.cache_cached_at,
        source_request.cache_key,
        source_request.request_id,
        source_request.source_id,
        source_request.source_name,
        source_request.source_slug,
        source_request.source_url,
        source_request.source_favicon
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_requests(pool: &PgPool) -> Result<Vec<Request>> {
    sqlx::query_as!(Request, "SELECT * FROM requests ORDER BY created_at DESC")
        .fetch_all(pool)
        .await
        .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_request(pool: &PgPool, request_id: &str) -> Result<Option<Request>> {
    sqlx::query_as!(
        Request,
        r#"
        SELECT * FROM requests
        WHERE id = $1
        "#,
        request_id,
    )
    .fetch_optional(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_request_source_requests(
    pool: &PgPool,
    request_id: &str,
) -> Result<Vec<SourceRequest>> {
    sqlx::query_as!(
        SourceRequest,
        r#"
        SELECT * FROM source_requests
        WHERE request_id = $1
        ORDER BY started_at DESC
        "#,
        request_id,
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_source_requests(pool: &PgPool, source_id: &str) -> Result<Vec<Request>> {
    sqlx::query_as!(
        Request,
        r#"
        SELECT requests.* FROM requests
        INNER JOIN source_requests ON requests.id = source_requests.request_id
        WHERE source_id = $1
        ORDER BY started_at DESC
        "#,
        source_id,
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}
