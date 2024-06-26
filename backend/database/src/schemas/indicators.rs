use serde::Deserialize;
use typeshare::typeshare;
use utoipa::ToSchema;

/// Kind of the indicator
#[derive(
    Deserialize,
    Debug,
    strum::Display,
    PartialEq,
    Eq,
    Clone,
    Copy,
    ToSchema,
    strum::EnumIter,
    strum::EnumString,
)]
#[typeshare]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
#[strum(serialize_all = "SCREAMING_SNAKE_CASE")]
pub enum IndicatorKind {
    Domain,
    Ipv4,
    Ipv6,
    Url,
    Email,
    Sha1,
    Sha256,
    Sha512,
    Md5,
    Tlsh,
    Ssdeep,
}

/// An indicator of compromise, containing the data and its kind
#[derive(Deserialize, ToSchema, Debug, Clone)]
#[typeshare]
pub struct Indicator {
    /// Data of the indicator
    pub data: String,
    /// Kind of the indicator
    pub kind: IndicatorKind,
}

impl Indicator {
    pub fn db_kind(&self) -> String {
        self.kind.to_string().to_uppercase()
    }
}
