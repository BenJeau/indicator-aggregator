use async_trait::async_trait;
use redis::FromRedisValue;
use redis_lib::{AsyncCommands, RedisWrite, ToRedisArgs};
use serde::de::DeserializeOwned;
use std::collections::HashMap;
use tracing::instrument;

use crate::{Cache, CacheEntry, CacheKey, InnerCache, Result};

#[derive(Clone)]
pub struct RedisCache {
    client: redis::Client,
}

impl RedisCache {
    pub fn new(url: &str) -> Result<Self> {
        Ok(Self {
            client: redis::Client::open(url)?,
        })
    }
}

impl ToRedisArgs for CacheKey {
    fn write_redis_args<W>(&self, out: &mut W)
    where
        W: ?Sized + RedisWrite,
    {
        String::from(self).write_redis_args(out)
    }
}

impl FromRedisValue for CacheKey {
    fn from_redis_value(v: &redis::Value) -> redis::RedisResult<Self> {
        let s = String::from_redis_value(v)?;
        let parts: Vec<_> = s.split(':').map(|s| s.to_string()).collect();

        Ok(Self(parts))
    }
}

#[async_trait]
impl InnerCache for RedisCache {
    #[instrument(skip_all)]
    async fn set_inner(&mut self, key: CacheKey, entry: Vec<u8>) -> Result<bool> {
        let mut conn = self.client.get_multiplexed_async_connection().await?;

        let mut pipe = redis::pipe();

        let data: (bool,) = pipe
            .atomic()
            .exists(&key)
            .set(key, entry)
            .ignore()
            .query_async(&mut conn)
            .await?;

        Ok(data.0)
    }

    #[instrument(skip_all)]
    async fn get_inner(&self, key: CacheKey) -> Result<Option<Vec<u8>>> {
        let mut conn = self.client.get_multiplexed_async_connection().await?;

        let data: Option<Vec<u8>> = conn.get(&key).await?;

        Ok(data)
    }
}

#[async_trait]
impl Cache for RedisCache {
    #[instrument(skip_all)]
    async fn invalidate<S: Into<CacheKey> + Send>(&mut self, key: S) -> Result<bool> {
        let mut conn = self.client.get_multiplexed_async_connection().await?;
        let value: bool = conn.del::<_, i32>(key.into()).await? > 0;

        Ok(value)
    }

    #[instrument(skip_all)]
    async fn partial_invalidate<S: Into<CacheKey> + Send>(
        &mut self,
        partial_key: S,
    ) -> Result<u64> {
        let partial_key = String::from(&partial_key.into());

        let mut conn = self.client.get_multiplexed_async_connection().await?;

        let keys: Vec<CacheKey> = conn.keys(&format!("{partial_key}*")).await?;
        let len = keys.len();

        conn.del(keys.clone()).await?;

        Ok(len as u64)
    }

    #[instrument(skip_all)]
    async fn clear(&mut self) -> Result<u64> {
        let mut conn = self.client.get_multiplexed_async_connection().await?;
        let num = conn.del("*").await?;

        Ok(num)
    }

    #[instrument(skip_all)]
    async fn keys(&self) -> Result<Vec<CacheKey>> {
        let mut conn = self.client.get_multiplexed_async_connection().await?;
        let keys = conn.keys("*").await?;

        Ok(keys)
    }

    #[instrument(skip_all)]
    async fn get_all<T: DeserializeOwned + Send>(
        &self,
    ) -> Result<HashMap<CacheKey, CacheEntry<T>>> {
        let mut conn = self.client.get_multiplexed_async_connection().await?;
        let keys = self.keys().await?;

        let mut data = HashMap::new();

        for key in keys {
            let value: Vec<u8> = conn.get(&key).await?;
            data.insert(key, serde_json::from_slice(&value)?);
        }

        Ok(data)
    }
}
