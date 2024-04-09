use serde::de::DeserializeOwned;
use tracing::{error, instrument};

use crate::{Error, Result};

#[instrument(err, ret)]
pub async fn handle_response<T>(response: reqwest::Response) -> Result<T>
where
    T: DeserializeOwned + std::fmt::Debug,
{
    if response.status().is_success() {
        Ok(response.json().await?)
    } else {
        let status = response.status();
        let body = response.text().await?;

        error!(status = ?status, body = ?body, "error fetching data");
        match status {
            reqwest::StatusCode::NOT_FOUND => Err(Error::NotFound),
            reqwest::StatusCode::UNAUTHORIZED | reqwest::StatusCode::FORBIDDEN => {
                Err(Error::Unauthorized)
            }
            reqwest::StatusCode::TOO_MANY_REQUESTS => Err(Error::RateLimited),
            _ => Err(Error::ResponseError),
        }
    }
}
