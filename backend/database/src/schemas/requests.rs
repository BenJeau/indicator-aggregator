use chrono::NaiveDateTime;
use serde::Serialize;
use sqlx::FromRow;
use typeshare::typeshare;
use utoipa::ToSchema;

#[derive(FromRow, ToSchema, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Request {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub data: String,
    pub kind: String,
    pub trace_id: String,
}

#[derive(FromRow, ToSchema, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct SourceRequest {
    pub id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub started_at: NaiveDateTime,
    pub ended_at: NaiveDateTime,
    pub errors: Vec<serde_json::Value>,
    pub data: Option<serde_json::Value>,
    pub cache_action: Option<String>,
    pub cache_expires_at: Option<NaiveDateTime>,
    pub cache_cached_at: Option<NaiveDateTime>,
    pub cache_key: Option<String>,
    pub request_id: String,
    pub source_id: Option<String>,
    pub source_name: String,
    pub source_url: String,
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
    pub source_url: String,
    pub source_favicon: Option<String>,
}
