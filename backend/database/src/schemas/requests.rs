use chrono::NaiveDateTime;
use serde::Serialize;
use sqlx::FromRow;
use typeshare::typeshare;
use utoipa::ToSchema;

/// User request against Indicator Aggregator to get source information
#[derive(FromRow, ToSchema, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Request {
    /// Database ID of the request
    pub id: String,
    /// Time when the request was created
    pub created_at: NaiveDateTime,
    /// Time when the request was updated
    pub updated_at: NaiveDateTime,
    /// Indicator data of the request
    pub data: String,
    /// Kind of the indicator
    pub kind: String,
    /// Opentelemetry trace ID of the request, can be used with Jaeger to trace the request
    pub trace_id: String,
}

/// Response of a source following a user request against it and snapshot values of the source (in case the source gets deleted/modified after the request)
#[derive(FromRow, ToSchema, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct SourceRequest {
    /// Database ID of the source request
    pub id: String,
    /// Time when the source request was created
    pub created_at: NaiveDateTime,
    /// Time when the source request was updated
    pub updated_at: NaiveDateTime,
    /// Time when the request was started
    pub started_at: NaiveDateTime,
    /// Time when the request was ended
    pub ended_at: NaiveDateTime,
    /// List of errors that occurred during the request
    pub errors: Vec<serde_json::Value>,
    /// Data produced by the source from the request
    pub data: Option<serde_json::Value>,
    /// Cache action performed, if any
    pub cache_action: Option<String>,
    /// Time when the cache expired, if any
    pub cache_expires_at: Option<NaiveDateTime>,
    /// Time when the cache was cached, if cache was present
    pub cache_cached_at: Option<NaiveDateTime>,
    /// Cache key used, if any
    pub cache_key: Option<String>,
    /// Database ID of the request
    pub request_id: String,
    // TODO: Shouldn't this field be always present??
    /// Database ID of the source
    pub source_id: Option<String>,
    /// Name of the source
    pub source_name: String,
    /// Slug of the source
    pub source_slug: String,
    /// URL of the source
    pub source_url: String,
    /// Favicon of the source
    pub source_favicon: Option<String>,
}

#[derive(Debug)]
pub struct CreateSourceRequest {
    pub started_at: NaiveDateTime,
    pub ended_at: NaiveDateTime,
    pub errors: Vec<serde_json::Value>,
    pub data: Option<serde_json::Value>,
    pub cache_action: Option<String>,
    pub cache_expires_at: Option<NaiveDateTime>,
    pub cache_cached_at: Option<NaiveDateTime>,
    pub cache_key: Option<String>,
    pub request_id: String,
    pub source_id: String,
    pub source_name: String,
    pub source_slug: String,
    pub source_url: String,
    pub source_favicon: Option<String>,
}
