use chrono::NaiveDateTime;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Source {
    pub id: String,
    pub slug: String,
}

#[derive(PartialEq, Eq)]
pub enum EventKind {
    Data,
    Start,
    Error,
}

impl EventKind {
    pub fn from_str(data: &str) -> Self {
        match data {
            "fetching_data" => Self::Data,
            "fetching_start" => Self::Start,
            "fetching_error" => Self::Error,
            _ => panic!("Invalid EventKind"),
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Data => "data",
            Self::Start => "start",
            Self::Error => "error",
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartData {
    pub has_source_code: bool,
    pub source: StartDataSource,
}

#[derive(Deserialize)]
pub struct StartDataSource {
    pub id: String,
    pub slug: String,
}

#[derive(Deserialize)]
pub struct ErrorData {
    pub kind: String,
}

#[derive(Deserialize)]
pub struct Data {
    pub data: serde_json::Value,
    pub timing: Timing,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Timing {
    pub started_at: NaiveDateTime,
    pub ended_at: NaiveDateTime,
}
