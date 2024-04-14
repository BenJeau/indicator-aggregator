use database::schemas::sources::SourceKind;
use serde::Serialize;
use typeshare::typeshare;
use utoipa::ToSchema;

use crate::Error;

/// Error encountered when fetching data from a source
#[derive(Serialize, Debug, ToSchema, Clone)]
#[serde(tag = "kind", content = "content", rename_all = "SCREAMING_SNAKE_CASE")]
#[typeshare]
pub enum SourceError {
    UnsupportedIndicator,
    DisabledIndicator,
    RunnerDisabled(SourceKind),
    SourceDisabled,
    ProviderDisabled(String),
    WithinIgnoreList(Vec<String>),
    MissingSecret(Vec<String>),
    Timeout,
    NotFound,
    Unauthorized,
    RequestError,
    ResponseError,
    DatabaseError,
    InternalServerError,
    MissingSourceCode,
    RateLimited,
}

impl From<Error> for SourceError {
    fn from(value: Error) -> Self {
        match value {
            Error::Timeout => SourceError::Timeout,
            Error::NotFound => SourceError::NotFound,
            Error::Unauthorized => SourceError::Unauthorized,
            Error::Reqwest(_) => SourceError::RequestError,
            Error::ResponseError => SourceError::ResponseError,
            Error::Postgres(_) => SourceError::DatabaseError,
            Error::MissingSourceCode => SourceError::MissingSourceCode,
            Error::RateLimited => SourceError::RateLimited,
            _ => SourceError::InternalServerError,
        }
    }
}
