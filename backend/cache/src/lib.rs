use async_trait::async_trait;
use std::collections::HashMap;
use tracing::{instrument, warn};
use typeshare::typeshare;
extern crate redis as redis_lib;
use chrono::NaiveDateTime;
use serde::{de::DeserializeOwned, Deserialize, Serialize};

mod implementations;

pub use implementations::CacheImpl;

#[derive(Debug)]
pub enum CacheError {
    SerdeJson(serde_json::Error),
    Redis(redis_lib::RedisError),
}

impl From<serde_json::Error> for CacheError {
    fn from(error: serde_json::Error) -> Self {
        Self::SerdeJson(error)
    }
}

impl From<redis_lib::RedisError> for CacheError {
    fn from(error: redis_lib::RedisError) -> Self {
        Self::Redis(error)
    }
}

pub type Result<T> = std::result::Result<T, CacheError>;

/// A cache entry, encapsulating the value and the timestamp of when it was created
#[derive(Debug, Serialize, Deserialize)]
#[typeshare]
pub struct CacheEntry<T> {
    /// Timestamp of when the cache entry was created
    pub timestamp: NaiveDateTime,
    /// The actual value of the cache entry
    pub value: T,
    /// The timespan after which the cache entry will be invalidated, if any
    pub expiration: Option<u32>,
}

pub struct SetCacheEntryResult {
    pub already_exists: bool,
    pub timestamp: NaiveDateTime,
}

impl From<(bool, NaiveDateTime)> for SetCacheEntryResult {
    fn from((already_exists, timestamp): (bool, NaiveDateTime)) -> Self {
        Self {
            already_exists,
            timestamp,
        }
    }
}

/// Cache key, consisting of a list of strings, used for cache hits and invalidations
#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default)]
#[typeshare]
pub struct CacheKey(pub Vec<String>);

impl CacheKey {
    fn matches_partial_cache_key(&self, partial_key: &CacheKey) -> bool {
        self.0.starts_with(&partial_key.0)
    }
}

impl<T: Into<String>> From<Vec<T>> for CacheKey {
    fn from(keys: Vec<T>) -> Self {
        Self(keys.into_iter().map(|key| key.into()).collect())
    }
}

impl<T: Into<String> + Clone> From<&Vec<T>> for CacheKey {
    fn from(keys: &Vec<T>) -> Self {
        keys.to_vec().into()
    }
}

impl From<String> for CacheKey {
    fn from(key: String) -> Self {
        Self(vec![key])
    }
}

impl From<&str> for CacheKey {
    fn from(key: &str) -> Self {
        Self(vec![key.to_string()])
    }
}

impl From<&CacheKey> for String {
    fn from(key: &CacheKey) -> Self {
        key.0.join(":")
    }
}

#[derive(Deserialize)]
pub struct CreateCacheEntry<T: Serialize, S: Into<CacheKey>> {
    pub key: S,
    pub value: T,
    pub expiration: Option<usize>,
}

#[async_trait]
pub trait InnerCache {
    async fn set_inner(&mut self, key: CacheKey, entry: Vec<u8>) -> Result<bool>;
    async fn get_inner(&self, key: CacheKey) -> Result<Option<Vec<u8>>>;
}

#[async_trait]
pub trait Cache: Clone + InnerCache {
    #[instrument(skip_all)]
    async fn set<T: Serialize + Send, S: Into<CacheKey> + Send>(
        &mut self,
        entry: CreateCacheEntry<T, S>,
    ) -> Result<SetCacheEntryResult> {
        let timestamp = chrono::Utc::now().naive_utc();

        let serialized_entry = serde_json::to_vec(&CacheEntry {
            timestamp,
            value: entry.value,
            expiration: entry.expiration.map(|e| e as u32),
        })?;

        let already_exists = self.set_inner(entry.key.into(), serialized_entry).await?;

        Ok((already_exists, timestamp).into())
    }

    #[instrument(skip_all)]
    async fn get<T: DeserializeOwned + Send, S: Into<CacheKey> + Send>(
        &mut self,
        key: S,
    ) -> Result<Option<CacheEntry<T>>> {
        let key = key.into();
        let data = self.get_inner(key.clone()).await?;
        let Some(data) = data else {
            return Ok(None);
        };

        let entry: CacheEntry<T> = serde_json::from_slice(&data)?;
        let Some(expiration) = entry.expiration else {
            return Ok(Some(entry));
        };

        let Some(expiration_timespan) = chrono::Duration::try_seconds(expiration as i64) else {
            warn!(
                ?key,
                "Failed to parse expiration timespan, will not invalidate cache entry"
            );
            return Ok(Some(entry));
        };

        if entry.timestamp + expiration_timespan < chrono::Utc::now().naive_utc() {
            self.invalidate(key).await?;
            return Ok(None);
        }

        Ok(Some(entry))
    }

    async fn invalidate<S: Into<CacheKey> + Send>(&mut self, key: S) -> Result<bool>;
    async fn partial_invalidate<S: Into<CacheKey> + Send>(&mut self, partial_key: S)
        -> Result<u64>;
    async fn clear(&mut self) -> Result<u64>;
    async fn keys(&self) -> Result<Vec<CacheKey>>;
    async fn get_all<T: DeserializeOwned + Send>(&self)
        -> Result<HashMap<CacheKey, CacheEntry<T>>>;
}
