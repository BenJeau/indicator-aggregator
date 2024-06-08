use axum::{extract::State, response::IntoResponse, Json};
use database::{logic::server_config::get_config_with_defaults_and_db_results, PgPool};

use crate::Result;

/// Get server configuration values
#[utoipa::path(
    get,
    tag = "config",
    path = "/config",
    responses(
        (status = 200, description = "Server configuration", body = ServerConfig)
    )
)]
pub async fn get_config(State(pool): State<PgPool>) -> Result<impl IntoResponse> {
    let config = get_config_with_defaults_and_db_results(&pool).await?;

    Ok(Json(config))
}

#[cfg(test)]
mod tests {
    use database::{
        logic::server_config::create_or_update_server_configs,
        schemas::server_config::{ServerConfig, UpdateServerConfig},
    };

    use crate::test_utils::*;

    #[tracing_test::traced_test]
    #[sqlx::test(migrations = "../database/migrations")]
    async fn given_no_db_changes_when_calling_get_config_endpoint_then_returns_default_config(
        pool: PgPool,
    ) {
        let response = request(Method::GET, "/api/v1/config", pool).await;
        assert_eq!(response.status(), StatusCode::OK);

        let data = json_response::<ServerConfig>(response).await;

        assert_eq!(data, ServerConfig::default());
    }

    #[tracing_test::traced_test]
    #[sqlx::test(migrations = "../database/migrations")]
    async fn given_db_changes_when_calling_get_config_endpoint_then_returns_combined_config(
        pool: PgPool,
    ) {
        let user_id = sqlx::query_scalar!("SELECT id FROM users WHERE name = 'system';")
            .fetch_one(&pool)
            .await
            .unwrap();
        create_or_update_server_configs(
            &pool,
            &[UpdateServerConfig {
                key: "javascript_source_template".to_string(),
                value: Some("test".to_string()),
            }],
            &user_id,
        )
        .await
        .unwrap();

        let response = request(Method::GET, "/api/v1/config", pool).await;
        assert_eq!(response.status(), StatusCode::OK);

        let data = json_response::<ServerConfig>(response).await;

        assert_eq!(
            data.javascript_source_template.value,
            Some("test".to_string())
        );
        assert!(data.javascript_source_template.id.is_some());
        assert!(data.javascript_source_template.created_at.is_some());
        assert!(data.javascript_source_template.updated_at.is_some());
    }
}
