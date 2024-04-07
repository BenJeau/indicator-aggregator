use axum::extract::FromRef;
use cache::CacheImpl;
use postgres::PgPool;
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

        let pool = postgres::connect_to_db(&config.database.url())
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
        let secrets = postgres::logic::secrets::internal_get_source_secrets(
            &self.pool,
            source_id,
            &self.crypto,
            &self.config.encryption.db_key,
        )
        .await?;

        Ok(FetchState::new(self.pool.clone(), secrets, *source_id))
    }
}
