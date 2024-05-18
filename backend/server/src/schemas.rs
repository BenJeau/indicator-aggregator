use serde::Deserialize;
use sources::schemas::SourceError;
use utoipa::IntoParams;

use chrono::NaiveDateTime;
use database::schemas::{
    indicators::{Indicator, IndicatorKind},
    requests::CreateSourceRequest,
};
use serde::Serialize;
use typeshare::typeshare;
use utoipa::ToSchema;

#[derive(Deserialize, IntoParams)]
pub struct GetFaviconParams {
    /// URL of the favicon to fetch
    pub url: String,
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
    /// List of source IDs to query, if not provided, all sources will be queried
    #[serde(default)]
    pub source_ids: Vec<String>,
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
    /// URL friendly name of the provider
    pub slug: String,
    /// Database ID of the source
    pub id: String,
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

impl Data {
    pub fn into_create_source_request(self, request_id: String) -> CreateSourceRequest {
        CreateSourceRequest {
            started_at: self.timing.started_at,
            ended_at: self.timing.ended_at,
            errors: self
                .errors
                .into_iter()
                .flat_map(serde_json::to_value)
                .collect(),
            data: self.data,
            cache_action: self.cache.action.map(|a| a.to_string()),
            cache_expires_at: self.cache.expires_at,
            cache_cached_at: self.cache.cached_at,
            cache_key: self.cache.cache_key,
            request_id,
            source_id: self.source.id,
            source_name: self.source.name,
            source_slug: self.source.slug,
            source_url: self.source.url,
            source_favicon: self.source.favicon,
        }
    }
}

/// Data returned from the creation of an API token
#[derive(Serialize, ToSchema, Debug, Clone)]
#[typeshare]
pub struct CreatedApiToken {
    /// The database ID of the API token
    pub id: String,
    /// The value of the API token
    pub token: String,
}
