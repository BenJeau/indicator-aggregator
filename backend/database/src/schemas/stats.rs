use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgRow, FromRow, Row};
use typeshare::typeshare;
use utoipa::ToSchema;

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

#[derive(Serialize, ToSchema, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CountPerId {
    pub id: Option<String>,
    pub name: Option<String>,
    pub count: i32,
}

#[derive(Serialize, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CountPerIdWrapper {
    pub data: Vec<CountPerId>,
    pub time_window: DateTime<Utc>,
}

impl FromRow<'_, PgRow> for CountPerIdWrapper {
    fn from_row(row: &PgRow) -> Result<Self, sqlx::Error> {
        Ok(Self {
            data: serde_json::from_value(row.try_get("data")?).unwrap_or_default(),
            time_window: row.try_get("time_window")?,
        })
    }
}

#[derive(FromRow, Serialize, ToSchema, Debug)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct CountPerHour {
    pub uncached_count: i32,
    pub cached_count: i32,
    pub time_window: DateTime<Utc>,
}
