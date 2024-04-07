use async_trait::async_trait;
use database::{
    logic::server_config::get_config_with_defaults_and_db_results,
    schemas::{indicators::Indicator, server_config},
};
use serde::de::DeserializeOwned;
use std::collections::HashMap;
use tracing::{error, instrument};
use uuid::Uuid;

pub mod error;
pub mod integrations;
pub mod schemas;

pub use error::{Error, Result};

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

pub struct FetchState {
    pool: database::PgPool,
    secrets: HashMap<String, String>,
    source_id: Uuid,
}

impl FetchState {
    pub fn new(pool: database::PgPool, secrets: HashMap<String, String>, source_id: Uuid) -> Self {
        Self {
            pool,
            secrets,
            source_id,
        }
    }

    async fn get_server_config(&self) -> Result<server_config::ServerConfig> {
        get_config_with_defaults_and_db_results(&self.pool)
            .await
            .map_err(Into::into)
    }
}

#[async_trait]
pub trait Source: Send + Sync {
    fn source_name(&self) -> &'static str {
        ""
    }

    async fn fetch_data(
        &self,
        indicator: &Indicator,
        state: &FetchState,
    ) -> Result<serde_json::Value>;

    async fn background_task(&self, _state: &FetchState) -> Result<()> {
        todo!()
    }
}
