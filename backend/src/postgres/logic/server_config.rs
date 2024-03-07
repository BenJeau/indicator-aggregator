use sqlx::PgPool;
use tracing::instrument;

use crate::{
    postgres::schemas::server_config::{ServerConfig, UpdateServerConfig},
    Result,
};

#[instrument(skip(pool), err)]
pub async fn get_all_server_configs(pool: &PgPool) -> Result<Vec<ServerConfig>> {
    sqlx::query_as!(
        ServerConfig,
        r#"SELECT id,
created_at,
updated_at,
key,
description,
friendly_name,
default_value,
kind as "kind: _",
category,
value
FROM server_config
ORDER BY key
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn update_server_configs(pool: &PgPool, configs: &[UpdateServerConfig]) -> Result<u64> {
    sqlx::query!(
        r#"
UPDATE server_config
SET description = temp.description,
    value = temp.value
FROM (
    SELECT * FROM UNNEST($1::uuid[], $2::text[], $3::text[]) AS t(id, description, value)
) AS temp
WHERE server_config.id = temp.id
        "#,
        configs.iter().map(|c| c.id).collect::<Vec<_>>() as _,
        configs
            .iter()
            .map(|c| c.description.as_str())
            .collect::<Vec<_>>() as _,
        configs
            .iter()
            .map(|c| c.value.as_ref().map(|s| s.as_str()))
            .collect::<Vec<_>>() as _
    )
    .execute(pool)
    .await
    .map_err(Into::into)
    .map(|e| e.rows_affected())
}
