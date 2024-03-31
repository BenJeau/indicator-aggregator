use serde::Serialize;
use sqlx::prelude::FromRow;
use typeshare::typeshare;
use utoipa::ToSchema;
use uuid::Uuid;

/// Overview of the number of providers, sources, and indicators
#[derive(FromRow, Serialize, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Count {
    /// Number of requests done in the past
    pub history: i32,
    /// Number of requests done in the past 24 hours
    pub history_last_24hrs: i32,
    /// Number of source providers
    pub providers: i32,
    /// Number of enabled source providers
    pub enabled_providers: i32,
    /// Number of sources
    pub sources: i32,
    /// Number of enabled sources
    pub enabled_sources: i32,
    /// Number of indicators
    pub ignore_lists: i32,
    /// Number of enabled indicators
    pub enabled_ignore_lists: i32,
}

#[derive(FromRow, Serialize, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CountPerId {
    pub id: Option<Uuid>,
    pub count: i32,
}
