use sqlx::{PgPool, QueryBuilder, Result};
use tracing::instrument;

use crate::schemas::phish_tank::Entry;

#[instrument(skip(pool), err)]
pub async fn get_phish_tank_by_url(url: &str, pool: &PgPool) -> Result<Vec<Entry>> {
    sqlx::query_as!(
        Entry,
        "SELECT phish_id, phish_detail_url, url, submission_time, verification_time, target, details FROM phishtank WHERE url = $1",
        url
    )
    .fetch_all(pool)
    .await
}

#[instrument(skip(pool), err)]
pub async fn get_phish_tank_by_domain(domain: &str, pool: &PgPool) -> Result<Vec<Entry>> {
    sqlx::query_as!(
        Entry,
        "SELECT phish_id, phish_detail_url, url, submission_time, verification_time, target, details FROM phishtank WHERE url ILIKE '%' || $1 || '%'",
        domain
    )
    .fetch_all(pool)
    .await
}

#[instrument(skip_all)]
pub async fn insert_entries(entries: &[Entry], pool: &PgPool) -> Result<()> {
    let mut query_builder = QueryBuilder::new("INSERT INTO phishtank (phish_id, phish_detail_url, url, submission_time, verification_time, target, details) ");

    query_builder.push_values(entries, |mut b, entry| {
        b.push_bind(entry.phish_id)
            .push_bind(&entry.phish_detail_url)
            .push_bind(&entry.url)
            .push_bind(entry.submission_time)
            .push_bind(entry.verification_time)
            .push_bind(&entry.target)
            .push_bind(&entry.details);
    });

    query_builder.push(" ON CONFLICT DO NOTHING");

    let query = query_builder.build();

    query.execute(pool).await?;

    Ok(())
}

#[instrument(skip_all)]
pub async fn insert_phish_tank_refresh(headers: &str, pool: &PgPool) -> Result<()> {
    sqlx::query!(
        "INSERT INTO phishtank_refreshes (response_headers) VALUES ($1)",
        headers
    )
    .execute(pool)
    .await?;

    Ok(())
}
