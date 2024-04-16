use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use typeshare::typeshare;
use utoipa::{IntoParams, ToSchema};

/// List of indicators to ignore when processing requests against sources
#[derive(FromRow, Serialize, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct IgnoreList {
    /// Database ID of the ignore list
    pub id: String,
    /// Timestamp of when the ignore list was created
    pub created_at: NaiveDateTime,
    /// Timestamp of when the ignore list was last updated
    pub updated_at: NaiveDateTime,
    /// Name of the ignore list
    pub name: String,
    /// URL friendly name of the ignore list
    pub slug: String,
    /// Description of the ignore list
    pub description: String,
    /// Whether the ignore list is enabled and used to ignore certain requests
    pub enabled: bool,
    /// Whether the ignore list is global and used to ignore all requests, regardless of it's source
    pub global: bool,
}

/// Parameters for creating a new ignore list
#[derive(Deserialize, Debug, ToSchema, IntoParams)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CreateIgnoreList {
    /// Name of the ignore list
    pub name: String,
    /// Description of the ignore list
    pub description: String,
    /// Whether the ignore list is enabled and used to ignore certain requests
    pub enabled: bool,
    /// Whether the ignore list is global and used to ignore all requests, regardless of it's source
    pub global: bool,
}

/// Parameters for updating an ignore list
#[derive(Deserialize, Debug, ToSchema, IntoParams)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct UpdateIgnoreList {
    /// Name of the ignore list
    pub name: Option<String>,
    /// Description of the ignore list
    pub description: Option<String>,
    /// Whether the ignore list is enabled and used to ignore certain requests
    pub enabled: Option<bool>,
    /// Whether the ignore list is global and used to ignore all requests, regardless of it's source
    pub global: Option<bool>,
}

/// Entry in an ignore list
#[derive(FromRow, Serialize, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct IgnoreListEntry {
    /// Database ID of the ignore list entry
    pub id: String,
    /// Timestamp of when the ignore list entry was created
    pub created_at: NaiveDateTime,
    /// Timestamp of when the ignore list entry was last updated
    pub updated_at: NaiveDateTime,
    /// Data of the indicator to ignore
    pub data: String,
    /// Kind of the indicator to ignore
    pub indicator_kind: String,
    /// Database ID of the ignore list the entry belongs to
    pub ignore_list_id: String,
}

/// Parameters for creating a new ignore list entry
#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CreateIngoreListEntry {
    /// Data of the indicator to ignore
    pub data: String,
    /// Kind of the indicator to ignore
    pub indicator_kind: String,
}
