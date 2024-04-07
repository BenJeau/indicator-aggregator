use sqlx::{PgPool, Result};
use tracing::instrument;

use crate::schemas::notifications::{MinimalSource, NotificationKind};

#[instrument(skip(pool), ret, err)]
pub async fn get_sources_without_secrets_set(pool: &PgPool) -> Result<Vec<NotificationKind>> {
    sqlx::query_as!(
        MinimalSource,
        r#"SELECT sources.id,
sources.name,
COUNT(source_secrets)::INT as "num_missing_secrets!: _"
FROM sources
INNER JOIN source_secrets ON sources.id = source_secrets.source_id
WHERE source_secrets.secret_id IS NULL AND source_secrets.required = TRUE
GROUP BY sources.id
HAVING COUNT(source_secrets) > 0"#
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
    .map(|n| {
        n.into_iter()
            .map(NotificationKind::MissingRequiredSourceSecret)
            .collect()
    })
}
