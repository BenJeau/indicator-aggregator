use axum::{extract::Query, http::StatusCode, response::IntoResponse};

use crate::{schemas::GetFaviconParams, Result};

/// Fetches the favicon 128px size for a given URL using Google's favicon service:
/// `http://www.google.com/s2/favicons?domain_url={url}&sz=128`
#[utoipa::path(
    get,
    path = "/favicon",
    tag = "favicon",
    params(GetFaviconParams),
    responses(
        (status = 200, description = "Favicon found", content_type = "image/png"),
        (status = 404, description = "Favicon not found"),
    ),
)]
pub async fn get_favicon(
    Query(GetFaviconParams { url }): Query<GetFaviconParams>,
) -> Result<impl IntoResponse> {
    let response = reqwest::get(&format!(
        "http://www.google.com/s2/favicons?domain_url={url}&sz=128"
    ))
    .await?;

    let mut response = if response.status().is_success() {
        response.bytes().await?.into_response()
    } else {
        StatusCode::NO_CONTENT.into_response()
    };

    response.headers_mut().insert(
        "Cache-Control",
        "public, max-age=86400, immutable, must-revalidate"
            .parse()
            .unwrap(),
    );

    Ok(response)
}

#[cfg(test)]
mod tests {
    use crate::test_utils::*;

    #[tracing_test::traced_test]
    #[sqlx::test]
    async fn given_valid_url_when_calling_get_favicon_endpoint_then_returns_favicon(pool: PgPool) {
        let endpoint = "/api/v1/favicon?url=http://www.google.com";
        let response = request(Method::GET, endpoint, pool).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.headers().get("content-type").unwrap(),
            "application/octet-stream"
        );
        assert_eq!(
            response.headers().get("cache-control").unwrap(),
            "public, max-age=86400, immutable, must-revalidate"
        )
    }

    #[tracing_test::traced_test]
    #[sqlx::test]
    async fn given_invalid_url_when_calling_get_favicon_endpoint_then_returns_no_content(
        pool: PgPool,
    ) {
        let response = request(Method::GET, "/api/v1/favicon?url=invalid", pool).await;

        assert_eq!(response.status(), StatusCode::NO_CONTENT);
    }
}
