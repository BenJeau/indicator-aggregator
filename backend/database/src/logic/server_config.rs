use sqlx::{PgPool, Result};
use tracing::instrument;

use crate::schemas::server_config::{DbServerConfig, ServerConfig, UpdateServerConfig};

#[instrument(skip(pool), err)]
pub async fn get_all_server_configs(pool: &PgPool) -> Result<Vec<DbServerConfig>> {
    sqlx::query_as!(DbServerConfig, "SELECT * FROM server_config")
        .fetch_all(pool)
        .await
        .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn create_or_update_server_configs(
    pool: &PgPool,
    configs: &[UpdateServerConfig],
    user_id: &str,
) -> Result<u64> {
    sqlx::query!(
        r#"
INSERT INTO server_config (key, value, last_modified_user_id)
SELECT *, $3 FROM UNNEST($1::text[], $2::text[]) AS t(key, value)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
last_modified_user_id = EXCLUDED.last_modified_user_id
        "#,
        configs.iter().map(|c| c.key.as_str()).collect::<Vec<_>>() as _,
        configs
            .iter()
            .map(|c| c.value.as_ref().map(|s| s.as_str()))
            .collect::<Vec<_>>() as _,
        user_id
    )
    .execute(pool)
    .await
    .map_err(Into::into)
    .map(|e| e.rows_affected())
}

#[instrument(skip(pool), ret, err)]
pub async fn remove_server_configs(pool: &PgPool, configs: &[UpdateServerConfig]) -> Result<u64> {
    sqlx::query!(
        r#"
DELETE FROM server_config
WHERE key = ANY($1::text[])
        "#,
        configs.iter().map(|c| c.key.as_str()).collect::<Vec<_>>() as _
    )
    .execute(pool)
    .await
    .map_err(Into::into)
    .map(|e| e.rows_affected())
}

#[instrument(skip(pool), ret, err)]
pub async fn get_config_with_defaults_and_db_results(pool: &PgPool) -> Result<ServerConfig> {
    let mut config = ServerConfig::default();

    let db_config = get_all_server_configs(pool).await?;

    config.combine_with_db_results(db_config);

    Ok(config)
}
