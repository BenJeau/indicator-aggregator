use database::{
    logic::server_config::get_config_with_defaults_and_db_results, schemas::server_config,
};
use std::collections::HashMap;
use uuid::Uuid;

use crate::Result;

pub struct FetchState {
    pub pool: database::PgPool,
    pub secrets: HashMap<String, String>,
    pub source_id: Uuid,
}

impl FetchState {
    pub fn new(pool: database::PgPool, secrets: HashMap<String, String>, source_id: Uuid) -> Self {
        Self {
            pool,
            secrets,
            source_id,
        }
    }

    pub async fn get_server_config(&self) -> Result<server_config::ServerConfig> {
        get_config_with_defaults_and_db_results(&self.pool)
            .await
            .map_err(Into::into)
    }
}
