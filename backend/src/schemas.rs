use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use typeshare::typeshare;
use utoipa::{IntoParams, ToSchema};
use uuid::Uuid;

use crate::Error;

/// Kind of the indicator
#[derive(Deserialize, Debug, strum::Display, PartialEq, Eq, Clone, Copy, ToSchema)]
#[typeshare]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum IndicatorKind {
    Domain,
    Ipv4,
    Ipv6,
    Url,
    Email,
    Sha1,
    Sha256,
    Sha512,
    Md5,
    Tlsh,
    Ssdeep,
}

#[derive(Deserialize, ToSchema, Debug, Clone)]
#[typeshare]
pub struct Indicator {
    /// Data of the indicator
    pub data: String,
    /// Kind of the indicator
    pub kind: IndicatorKind,
}

impl Indicator {
    pub fn db_kind(&self) -> String {
        self.kind.to_string().to_uppercase()
    }
}

/// Request to get the data for a specific indicator from enabled sources supporting the indicator kind
#[derive(Deserialize, ToSchema, IntoParams, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct RequestExecuteParam {
    /// Data of the indicator
    pub data: String,
    /// Kind of the indicator
    pub kind: IndicatorKind,
    /// List of sources to query, if not provided, all sources will be queried
    #[serde(default)]
    pub sources: Vec<Uuid>,
    /// Ignore errors, will remove all sources that return an error from the response
    #[serde(default)]
    pub ignore_errors: bool,
}

impl From<RequestExecuteParam> for Indicator {
    fn from(value: RequestExecuteParam) -> Self {
        Self {
            kind: value.kind,
            data: value.data,
        }
    }
}

/// Data from a source
#[derive(Serialize, Debug, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Data {
    pub source: DataSource,
    #[serde(skip_serializing_if = "should_skip_serializing_data_cache")]
    pub cache: DataCache,
    pub timing: DataTiming,
    /// Error encountered when fetching the data, if any
    pub errors: Vec<SourceError>,
    /// Data fetched from the source
    pub data: Option<serde_json::Value>,
}

#[derive(Serialize, Debug, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct DataSource {
    /// Name of the source
    pub name: String,
    /// Database ID of the source
    pub id: Uuid,
    /// Documentation URL of the source
    pub url: String,
    /// Favicon of the source in base64
    #[serde(skip_serializing_if = "Option::is_none")]
    pub favicon: Option<String>,
}

#[derive(Serialize, Debug, ToSchema, Default, Clone)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct DataCache {
    /// Action related to the cache
    #[serde(skip_serializing_if = "Option::is_none")]
    pub action: Option<DataCacheAction>,
    /// Time at which the data was cached
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cached_at: Option<NaiveDateTime>,
    /// Time at which the data will expire from the cache
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<NaiveDateTime>,
    /// Cache key used to fetch the data
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cache_key: Option<String>,
}

fn should_skip_serializing_data_cache(cache: &DataCache) -> bool {
    cache.action.is_none()
        && cache.cached_at.is_none()
        && cache.expires_at.is_none()
        && cache.cache_key.is_none()
}

#[derive(Serialize, Debug, ToSchema, Clone, strum::Display)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
#[typeshare]
pub enum DataCacheAction {
    FromCache,
    SavedToCache,
}

#[derive(Serialize, Debug, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct DataTiming {
    /// Time at the start of the request
    pub started_at: NaiveDateTime,
    /// Time at the end of the request
    pub ended_at: NaiveDateTime,
}

impl DataCache {
    pub fn new(
        action: Option<DataCacheAction>,
        cached_at: Option<NaiveDateTime>,
        expires_at: Option<NaiveDateTime>,
        cache_key: Option<String>,
    ) -> Self {
        Self {
            action,
            cached_at,
            expires_at,
            cache_key,
        }
    }
}

/// Data from a source
#[derive(Serialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct SseDoneData {
    #[serde(skip_serializing_if = "should_skip_serializing_data_cache")]
    pub cache: DataCache,
    pub timing: DataTiming,
    /// Data fetched from the source
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
}

impl From<Data> for SseDoneData {
    fn from(value: Data) -> Self {
        Self {
            cache: value.cache,
            timing: value.timing,
            data: value.data,
        }
    }
}

/// Start SSE data from a source
#[derive(Serialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct SseStartData {
    pub source: DataSource,
    /// Has source code linked
    pub has_source_code: bool,
}

impl SseStartData {
    pub fn from_inner(source: DataSource, has_source_code: bool) -> Self {
        Self {
            source,
            has_source_code,
        }
    }
}

/// Error encountered when fetching data from a source
#[derive(Serialize, Debug, ToSchema, Clone)]
#[serde(tag = "kind", content = "content", rename_all = "SCREAMING_SNAKE_CASE")]
#[typeshare]
pub enum SourceError {
    UnsupportedIndicator,
    DisabledIndicator,
    SourceDisabled,
    ProviderDisabled(Uuid),
    WithinIgnoreList(Vec<Uuid>),
    MissingSecret(Vec<Uuid>),
    Timeout,
    NotFound,
    Unauthorized,
    RequestError,
    ResponseError,
    DatabaseError,
    InternalServerError,
    MissingSourceCode,
    RateLimited,
}

impl From<Error> for SourceError {
    fn from(value: Error) -> Self {
        match value {
            Error::Timeout => SourceError::Timeout,
            Error::NotFound => SourceError::NotFound,
            Error::Unauthorized => SourceError::Unauthorized,
            Error::RequestError(_) => SourceError::RequestError,
            Error::ResponseError => SourceError::ResponseError,
            Error::SqlxError(_) => SourceError::DatabaseError,
            Error::MissingSourceCode => SourceError::MissingSourceCode,
            Error::RateLimited => SourceError::RateLimited,
            _ => SourceError::InternalServerError,
        }
    }
}

#[derive(Deserialize, IntoParams)]
pub struct GetFaviconParams {
    /// URL of the favicon to fetch
    pub url: String,
}
