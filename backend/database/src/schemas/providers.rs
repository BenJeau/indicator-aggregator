use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use typeshare::typeshare;
use utoipa::ToSchema;

/// Source provider, organization or service that provides indicators with the number of sources it has
#[derive(FromRow, Serialize, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Provider {
    /// Database ID of the provider
    pub id: String,
    /// Timestamp of the creation of the provider
    pub created_at: NaiveDateTime,
    /// Timestamp of the last update of the provider
    pub updated_at: NaiveDateTime,
    /// Name of the provider
    pub name: String,
    /// URL friendly name of the provider
    pub slug: String,
    /// Description of the provider
    pub description: String,
    /// Documentation URL of the provider
    pub url: String,
    /// Favicon of the provider in base64
    pub favicon: Option<String>,
    /// Tags of the provider
    pub tags: Vec<String>,
    /// Whether the provider is enabled
    pub enabled: bool,
    /// Number of sources the provider has
    pub num_sources: i32,
}

/// Fields returned after creating a provider
#[derive(FromRow, Serialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CreatedProvider {
    /// Database ID of the provider
    pub id: String,
    /// URL friendly name of the provider
    pub slug: String,
}

/// Parameters to create a provider
#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CreateProvider {
    /// Name of the provider
    pub name: String,
    /// Description of the provider
    pub description: String,
    /// Documentation URL of the provider
    pub url: String,
    /// Favicon of the provider in base64
    pub favicon: Option<String>,
    /// Tags of the provider
    pub tags: Option<Vec<String>>,
    /// Whether the provider is enabled
    pub enabled: Option<bool>,
}

/// Parameters to partially update a provider
#[derive(Deserialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct PatchProvider {
    /// Name of the provider
    pub name: Option<String>,
    /// Description of the provider
    pub description: Option<String>,
    /// Documentation URL of the provider
    pub url: Option<String>,
    /// Favicon of the provider in base64
    pub favicon: Option<String>,
    /// Tags of the provider
    pub tags: Option<Vec<String>>,
    /// Whether the provider is enabled
    pub enabled: Option<bool>,
}
