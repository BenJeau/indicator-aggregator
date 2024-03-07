use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Type};
use typeshare::typeshare;
use utoipa::ToSchema;
use uuid::Uuid;

/// Enum containing the different kinds of server configuration entries
#[derive(Deserialize, Serialize, Debug, Type, Clone, Eq, PartialEq, Hash, ToSchema)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
#[sqlx(rename_all = "lowercase", type_name = "server_config_kind")]
#[typeshare]
pub enum ServerConfigKind {
    String,
    Number,
    Boolean,
    Code,
}

/// Configuration entry for the server
#[derive(FromRow, Serialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct ServerConfig {
    /// Database ID of the server config entry
    pub id: Uuid,
    /// Timestamp of the creation of the server config entry
    pub created_at: NaiveDateTime,
    /// Timestamp of the last update of the server config entry
    pub updated_at: NaiveDateTime,
    /// Name of the server config entry
    pub key: String,
    /// Friendly name of the server config entry
    pub friendly_name: String,
    /// Brief description of the server config entry
    pub description: String,
    /// Default value of the server config entry
    pub default_value: String,
    /// Kind of the server config entry
    pub kind: ServerConfigKind,
    /// Category grouping server config entries
    pub category: Option<String>,
    /// User defined value of the server config entry, if any, otherwise defaults to the default value
    pub value: Option<String>,
}

/// Parameters for updating a server config entry
#[derive(Deserialize, Debug, ToSchema)]
#[typeshare]
pub struct UpdateServerConfig {
    /// Database ID of the server config entry to update
    pub id: Uuid,
    /// Brief description of the server config entry
    pub description: String,
    /// User defined value of the server config entry, if any, otherwise defaults to the default value
    pub value: Option<String>,
}
