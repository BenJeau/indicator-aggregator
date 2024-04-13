use axum::extract::FromRef;
use cache::CacheImpl;
use database::PgPool;
use shared::crypto::Crypto;
use sources::FetchState;
use tracing::instrument;
use uuid::Uuid;

use crate::{config::Config, Result};

#[derive(Clone)]
pub struct ServerState {
    pub pool: PgPool,
    pub config: Config,
    pub crypto: Crypto,
    pub cache: CacheImpl,
}

impl FromRef<ServerState> for PgPool {
    fn from_ref(state: &ServerState) -> Self {
        state.pool.clone()
    }
}

impl FromRef<ServerState> for Crypto {
    fn from_ref(state: &ServerState) -> Self {
        state.crypto.clone()
    }
}

impl ServerState {
    #[instrument(skip_all)]
    pub async fn new() -> Self {
        let config = Config::new().expect("Failed to load config");

        let pool = database::connect_to_db(&config.database.url())
            .await
            .expect("Failed to connect to database");

        let crypto = Crypto::new(&config.encryption.server_key);

        let cache = if let Some(url) = &config.cache.redis_url {
            CacheImpl::redis(url).expect("Failed to connect to redis")
        } else {
            CacheImpl::in_memory()
        };

        Self {
            pool,
            config,
            crypto,
            cache,
        }
    }

    pub async fn into_fetch_state(&self, source_id: &Uuid) -> Result<FetchState> {
        let secrets = database::logic::secrets::internal_get_source_secrets(
            &self.pool,
            source_id,
            &self.crypto,
            &self.config.encryption.db_key,
        )
        .await?;

        Ok(FetchState::new(self.pool.clone(), secrets, *source_id))
    }
}

#[cfg(test)]
pub mod test {
    use super::*;
    use crate::config::test::create_config;

    pub fn create_state(pool: PgPool) -> ServerState {
        let config = create_config();
        let crypto = Crypto::new(&config.encryption.server_key);
        let cache = CacheImpl::in_memory();

        ServerState {
            pool,
            config,
            crypto,
            cache,
        }
    }
}
