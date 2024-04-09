use sqlx::{PgPool, QueryBuilder, Result};
use tracing::instrument;

use crate::schemas::url_haus::Entry;

#[instrument(skip(pool), err)]
pub async fn get_url_haus_by_url(url: &str, pool: &PgPool) -> Result<Vec<Entry>> {
    sqlx::query_as!(
        Entry,
        "SELECT id, dateadded, url, url_status, last_online, threat, tags, urlhaus_link, reporter FROM url_haus WHERE url = $1",
        url
    )
    .fetch_all(pool)
    .await
}

#[instrument(skip(pool), err)]
pub async fn get_url_haus_by_domain(domain: &str, pool: &PgPool) -> Result<Vec<Entry>> {
    sqlx::query_as!(
        Entry,
        "SELECT id, dateadded, url, url_status, last_online, threat, tags, urlhaus_link, reporter FROM url_haus WHERE url ILIKE '%' || $1 || '%'",
        domain
    )
    .fetch_all(pool)
    .await
}

#[instrument(skip_all)]
pub async fn insert_entries(entries: &[Entry], pool: &PgPool) -> Result<()> {
    let mut query_builder = QueryBuilder::new("INSERT INTO url_haus (id, dateadded, url, url_status, last_online, threat, tags, urlhaus_link, reporter) ");

    query_builder.push_values(entries, |mut b, entry| {
        b.push_bind(entry.id)
            .push_bind(entry.dateadded)
            .push_bind(&entry.url)
            .push_bind(&entry.url_status)
            .push_bind(entry.last_online)
            .push_bind(&entry.threat)
            .push_bind(&entry.tags)
            .push_bind(&entry.urlhaus_link)
            .push_bind(&entry.reporter);
    });

    query_builder.push(" ON CONFLICT DO NOTHING");

    let query = query_builder.build();

    query.execute(pool).await?;

    Ok(())
}

#[instrument(skip_all)]
pub async fn insert_url_haus_refresh(headers: &str, pool: &PgPool) -> Result<()> {
    sqlx::query!(
        "INSERT INTO url_haus_refreshes (response_headers) VALUES ($1)",
        headers
    )
    .execute(pool)
    .await?;

    Ok(())
}
