use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use database::{
    logic::server_config,
    schemas::server_config::{UpdateServerConfig, SERVER_CONFIG_ENTRIES},
    PgPool,
};

use crate::Result;

/// Update server configuration values
#[utoipa::path(
    put,
    tag = "config",
    path = "/config",
    responses((status = 204, description = "Server configuration updated")),
    request_body(
        description = "Server configuration",
        content_type = "application/json",
        content = Vec<UpdateServerConfig>
    )
)]
pub async fn update_config(
    State(pool): State<PgPool>,
    Json(data): Json<Vec<UpdateServerConfig>>,
) -> Result<impl IntoResponse> {
    let filtered_data = data
        .into_iter()
        .filter(|config| SERVER_CONFIG_ENTRIES.contains(&config.key.as_str()));

    let (should_create_or_update, should_remove): (Vec<_>, Vec<_>) =
        filtered_data.partition(|config| config.value.is_some());

    if !should_create_or_update.is_empty() {
        server_config::create_or_update_server_configs(&pool, &should_create_or_update).await?;
    }

    if !should_remove.is_empty() {
        server_config::remove_server_configs(&pool, &should_remove).await?;
    }

    Ok(StatusCode::NO_CONTENT)
}

#[cfg(test)]
mod tests {
    use database::{
        logic::server_config::get_config_with_defaults_and_db_results,
        schemas::server_config::SERVER_CONFIG_ENTRIES,
    };

    use crate::test_utils::*;

    async fn get_count_server_config(pool: &PgPool) -> i64 {
        sqlx::query_scalar!(r#"SELECT COUNT(*) as "count!: _" FROM server_config"#)
            .fetch_one(pool)
            .await
            .unwrap()
    }

    #[tracing_test::traced_test]
    #[sqlx::test]
    async fn given_request_without_json_when_calling_update_config_endpoint_then_returns_415_error(
        pool: PgPool,
    ) {
        let response = request(Method::PUT, "/api/v1/config", pool).await;
        assert_eq!(response.status(), StatusCode::UNSUPPORTED_MEDIA_TYPE);

        let actual = str_response(response).await;
        let expected = "Expected request with `Content-Type: application/json`";
        assert_eq!(&actual, expected);
    }

    #[tracing_test::traced_test]
    #[sqlx::test]
    async fn given_request_with_invalid_json_when_calling_update_config_endpoint_then_returns_422_error(
        pool: PgPool,
    ) {
        let request_body = json!({"test": "weird data"});
        let response = json_request(Method::PUT, "/api/v1/config", pool, request_body).await;
        assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let actual = str_response(response).await;
        let expected = "Failed to deserialize the JSON body into the target type:";
        assert!(actual.starts_with(expected));
    }

    #[tracing_test::traced_test]
    #[sqlx::test(migrations = "../database/migrations")]
    async fn given_request_with_an_unknown_config_when_calling_update_config_endpoint_then_does_not_update_config(
        pool: PgPool,
    ) {
        let request_body = json!([{"key": "no_real_server_config", "value": "test"}]);
        let response =
            json_request(Method::PUT, "/api/v1/config", pool.clone(), request_body).await;
        assert_eq!(response.status(), StatusCode::NO_CONTENT);

        let count = get_count_server_config(&pool).await;
        assert_eq!(count, 0);
    }

    #[tracing_test::traced_test]
    #[sqlx::test(migrations = "../database/migrations")]
    async fn given_request_with_a_valid_config_when_calling_update_config_endpoint_then_update_config_in_database(
        pool: PgPool,
    ) {
        let request_body = json!([{"key": SERVER_CONFIG_ENTRIES[0], "value": "test"}]);
        let response =
            json_request(Method::PUT, "/api/v1/config", pool.clone(), request_body).await;
        assert_eq!(response.status(), StatusCode::NO_CONTENT);

        #[derive(sqlx::FromRow)]
        struct KeyValue {
            key: String,
            value: String,
        }

        let data = sqlx::query_as!(KeyValue, r#"SELECT key, value FROM server_config"#)
            .fetch_one(&pool)
            .await
            .unwrap();

        assert_eq!(data.key, SERVER_CONFIG_ENTRIES[0]);
        assert_eq!(data.value, "test");
    }

    #[tracing_test::traced_test]
    #[sqlx::test(migrations = "../database/migrations")]
    async fn given_request_with_a_valid_config_when_calling_update_config_endpoint_then_update_config_in_returned_config(
        pool: PgPool,
    ) {
        let request_body = json!([{"key": "javascript_source_template", "value": "test"}]);
        let response =
            json_request(Method::PUT, "/api/v1/config", pool.clone(), request_body).await;
        assert_eq!(response.status(), StatusCode::NO_CONTENT);

        let data = get_config_with_defaults_and_db_results(&pool)
            .await
            .unwrap();

        assert_eq!(
            data.javascript_source_template.value,
            Some("test".to_string())
        );
    }

    #[tracing_test::traced_test]
    #[sqlx::test(migrations = "../database/migrations")]
    async fn given_request_with_a_valid_config_and_empty_value_when_calling_update_config_endpoint_then_do_nothing(
        pool: PgPool,
    ) {
        let request_body = json!([{ "key": "javascript_source_template" }]);
        let response =
            json_request(Method::PUT, "/api/v1/config", pool.clone(), request_body).await;
        assert_eq!(response.status(), StatusCode::NO_CONTENT);

        let count = get_count_server_config(&pool).await;
        assert_eq!(count, 0);
    }

    #[tracing_test::traced_test]
    #[sqlx::test(migrations = "../database/migrations")]
    async fn given_request_with_an_empty_value_that_the_key_was_in_db_when_calling_update_config_endpoint_then_remove_db_entry(
        pool: PgPool,
    ) {
        let request_body = json!([{ "key": "javascript_source_template", "value": "data" }]);
        let response =
            json_request(Method::PUT, "/api/v1/config", pool.clone(), request_body).await;
        assert_eq!(response.status(), StatusCode::NO_CONTENT);

        let count = get_count_server_config(&pool).await;
        assert_eq!(count, 1);

        let request_body = json!([{ "key": "javascript_source_template" }]);
        let response =
            json_request(Method::PUT, "/api/v1/config", pool.clone(), request_body).await;
        assert_eq!(response.status(), StatusCode::NO_CONTENT);

        let count = get_count_server_config(&pool).await;
        assert_eq!(count, 0);
    }
}
