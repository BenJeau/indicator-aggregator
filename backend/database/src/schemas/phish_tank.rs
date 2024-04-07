use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Entry {
    pub phish_id: i32,
    pub phish_detail_url: String,
    pub url: String,
    #[serde(deserialize_with = "crate::utils::phish_tank_deserialize")]
    pub submission_time: NaiveDateTime,
    #[serde(deserialize_with = "crate::utils::phish_tank_deserialize")]
    pub verification_time: NaiveDateTime,
    pub target: String,
    pub details: serde_json::Value,
}
