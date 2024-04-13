use axum::{response::IntoResponse, Json};
use serde_json::json;

use crate::error::Result;

// Verifies if the backend is healthy and it's related services
#[utoipa::path(
    get,
    path = "/health",
    tag = "health",
    responses(
        (status = 200, example = json!({"status": "ok"}), description = "Backend is healthy"),
    ),
)]
pub async fn health() -> Result<impl IntoResponse> {
    Ok(Json(json!({"status": "ok"})))
}

#[cfg(test)]
mod tests {
    use crate::test_utils::*;

    #[tracing_test::traced_test]
    #[sqlx::test]
    async fn given_simple_request_when_calling_health_endpoint_then_returns_ok_status(
        pool: PgPool,
    ) {
        let response = request(Method::GET, "/api/v1/health", pool).await;
        assert_eq!(response.status(), StatusCode::OK);

        let body = json_response::<Value>(response).await;
        assert_eq!(&body, &json!({"status": "ok"}));
    }
}
