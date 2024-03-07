use serde::Serialize;
use sqlx::prelude::FromRow;
use typeshare::typeshare;
use utoipa::ToSchema;

/// Overview of the number of providers, sources, and indicators
#[derive(FromRow, Serialize, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Count {
    /// Number of requests done in the past
    pub history: i32,
    /// Number of source providers
    pub providers: i32,
    /// Number of sources
    pub sources: i32,
    /// Number of indicators
    pub ignore_lists: i32,
}
