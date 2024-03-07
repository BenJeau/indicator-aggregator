use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::{prelude::FromRow, Type};
use typeshare::typeshare;
use utoipa::ToSchema;
use uuid::Uuid;

/// Kind of the source, related to the language used for corelating data from the source
#[derive(Deserialize, Serialize, Debug, Type, Clone, Eq, PartialEq, Hash, ToSchema)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
#[sqlx(rename_all = "lowercase", type_name = "source_kind")]
#[typeshare]
pub enum SourceKind {
    System,
    Python,
    JavaScript,
}

/// A place where indicator data is retrieved from
#[derive(FromRow, Serialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Source {
    /// Database ID of the source
    pub id: Uuid,
    /// Timestamp of the creation of the source
    pub created_at: NaiveDateTime,
    /// Timestamp of the last update of the source
    pub updated_at: NaiveDateTime,
    /// Name of the source
    pub name: String,
    /// Description of the source
    pub description: String,
    /// Documentation URL of the source
    pub url: String,
    /// Favicon of the provider in base64
    pub favicon: Option<String>,
    /// Tags of the source
    pub tags: Vec<String>,
    /// Whether the source is enabled, if not, it will not be used when handling indicator requests
    pub enabled: bool,
    /// Indicator kinds supported by the source
    pub supported_indicators: Vec<String>,
    /// Indicator kinds disabled by the source
    pub disabled_indicators: Vec<String>,
    /// Whether the source's background task is enabled
    pub task_enabled: bool,
    /// Interval in seconds between the source's background task executions
    pub task_interval: Option<i32>,
    /// Configuration of the source
    pub config: Vec<serde_json::Value>,
    /// Values of the source's configuration
    pub config_values: Vec<serde_json::Value>,
    /// Whether the source has a limit of indicator requests
    pub limit_enabled: bool,
    /// Maximum number of indicator requests allowed per interval
    pub limit_count: Option<i32>,
    /// Interval in seconds between the source's limit resets
    pub limit_interval: Option<i32>,
    /// Whether the source's cache is enabled
    pub cache_enabled: bool,
    /// Interval in seconds between the source's cache resets
    pub cache_interval: Option<i32>,
    /// Database ID of the linked provider of the source
    pub provider_id: Option<Uuid>,
    /// Kind of the source, related to the language used for corelating data from the source
    pub kind: SourceKind,
    /// Source code of the source
    pub source_code: Option<String>,
}

/// Parameters to create a source
#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CreateSource {
    /// Name of the source
    pub name: String,
    /// Description of the source
    pub description: String,
    /// Documentation URL of the source
    pub url: String,
    /// Favicon of the provider in base64
    pub favicon: Option<String>,
    /// Tags of the source
    pub tags: Vec<String>,
    /// Whether the source is enabled
    pub enabled: bool,
    /// Indicator kinds supported by the source
    pub supported_indicators: Vec<String>,
    /// Indicator kinds disabled by the source
    pub disabled_indicators: Vec<String>,
    /// Whether the source's background task is enabled
    pub task_enabled: bool,
    /// Interval in seconds between the source's background task executions
    pub task_interval: Option<i32>,
    /// Configuration of the source
    pub config: Vec<serde_json::Value>,
    /// Values of the source's configuration
    pub config_values: Vec<serde_json::Value>,
    /// Whether the source has a limit of indicator requests
    pub limit_enabled: bool,
    /// Maximum number of indicator requests allowed per interval
    pub limit_count: Option<i32>,
    /// Interval in seconds between the source's limit resets
    pub limit_interval: Option<i32>,
    /// Whether the source's cache is enabled
    pub cache_enabled: bool,
    /// Interval in seconds between the source's cache resets
    pub cache_interval: Option<i32>,
    /// Database ID of the linked provider of the source
    pub provider_id: Option<Uuid>,
    /// Kind of the source, related to the language used for corelating data from the source
    pub kind: SourceKind,
    /// Source code of the source
    pub source_code: Option<String>,
}

/// Parameters to partially update a source
#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct UpdateSource {
    /// Name of the source
    pub name: Option<String>,
    /// Description of the source
    pub description: Option<String>,
    /// Documentation URL of the source
    pub url: Option<String>,
    /// Favicon of the provider in base64
    pub favicon: Option<String>,
    /// Tags of the source
    pub tags: Option<Vec<String>>,
    /// Whether the source is enabled
    pub enabled: Option<bool>,
    /// Indicator kinds supported by the source
    pub supported_indicators: Option<Vec<String>>,
    /// Indicator kinds disabled by the source
    pub disabled_indicators: Option<Vec<String>>,
    /// Whether the source's background task is enabled
    pub task_enabled: Option<bool>,
    /// Interval in seconds between the source's background task executions
    pub task_interval: Option<i32>,
    /// Configuration of the source
    pub config: Option<Vec<serde_json::Value>>,
    /// Values of the source's configuration
    pub config_values: Option<Vec<serde_json::Value>>,
    /// Whether the source has a limit of indicator requests
    pub limit_enabled: Option<bool>,
    /// Maximum number of indicator requests allowed per interval
    pub limit_count: Option<i32>,
    /// Interval in seconds between the source's limit resets
    pub limit_interval: Option<i32>,
    /// Whether the source's cache is enabled
    pub cache_enabled: Option<bool>,
    /// Interval in seconds between the source's cache resets
    pub cache_interval: Option<i32>,
    /// Database ID of the linked provider of the source
    pub provider_id: Option<Uuid>,
    /// Kind of the source, related to the language used for corelating data from the source
    pub kind: Option<SourceKind>,
    /// Source code of the source
    pub source_code: Option<String>,
}

#[derive(FromRow, Debug, Clone)]
pub struct InternalRequest {
    pub source_id: Uuid,
    pub source_enabled: bool,
    pub source_name: String,
    pub source_url: String,
    pub source_favicon: Option<String>,
    pub source_supported_indicators: Vec<String>,
    pub source_disabled_indicators: Vec<String>,
    pub source_cache_enabled: bool,
    pub source_cache_interval: Option<i32>,
    pub provider_id: Option<Uuid>,
    pub provider_enabled: Option<bool>,
    pub missing_source_secrets: Vec<Uuid>,
    pub within_ignore_lists: Vec<Uuid>,
}
