use serde::Serialize;
use sqlx::FromRow;
use typeshare::typeshare;
use utoipa::ToSchema;

pub mod auth;
pub mod ignore_lists;
pub mod indicators;
pub mod notifications;
pub mod phish_tank;
pub mod providers;
pub mod requests;
pub mod secrets;
pub mod server_config;
pub mod sources;
pub mod stats;
pub mod url_haus;
pub mod users;

/// Database ID and URL friendly name
#[derive(FromRow, Serialize, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct IdSlug {
    /// Database ID
    pub id: String,
    /// URL friendly name
    pub slug: String,
}
