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
