use chrono::NaiveDateTime;
use serde::Serialize;
use sqlx::FromRow;
use typeshare::typeshare;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::schemas::Data;

#[derive(FromRow, ToSchema, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Request {
    pub id: Uuid,
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
    pub id: Uuid,
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
    pub request_id: Uuid,
    pub source_id: Option<Uuid>,
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
    pub request_id: Uuid,
    pub source_id: Uuid,
    pub source_name: String,
    pub source_url: String,
    pub source_favicon: Option<String>,
}

impl CreateSourceRequest {
    pub fn from_data(data: Data, request_id: Uuid) -> Self {
        Self {
            started_at: data.timing.started_at,
            ended_at: data.timing.ended_at,
            errors: data
                .errors
                .into_iter()
                .flat_map(serde_json::to_value)
                .collect(),
            data: data.data,
            cache_action: data.cache.action.map(|a| a.to_string()),
            cache_expires_at: data.cache.expires_at,
            cache_cached_at: data.cache.cached_at,
            cache_key: data.cache.cache_key,
            request_id,
            source_id: data.source.id,
            source_name: data.source.name,
            source_url: data.source.url,
            source_favicon: data.source.favicon,
        }
    }
}
