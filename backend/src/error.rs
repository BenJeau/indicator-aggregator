use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use strum::Display;
use tracing::error;

use postgres::schemas::indicators::IndicatorKind;

#[derive(Debug, Display)]
pub enum Error {
    InvalidIndicatorType {
        kind: String,
        supported_indicators: Vec<String>,
    },
    ResponseError,
    IoError(std::io::Error),
    SqlxError(postgres::Error),
    NotFound,
    Unauthorized,
    Timeout,
    InternalError,
    MissingSourceCode,
    RateLimited,
    FigmentError(figment::Error),
    InvalidConfig(String),
    Conflict(String),
    Reqwest(reqwest::Error),
    InvalidIndicatorKind(IndicatorKind),
    Url(url::ParseError),
    CacheError(cache::CacheError),
    TonicTransportError(tonic::transport::Error),
    TonicStatus(tonic::Status),
    InvalidHeaderValue(reqwest::header::InvalidHeaderValue),
    ZipError(sources::error::ZipError),
}

impl std::error::Error for Error {}

impl From<reqwest::Error> for Error {
    fn from(e: reqwest::Error) -> Self {
        Self::Reqwest(e)
    }
}

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Self::IoError(error)
    }
}

impl From<postgres::Error> for Error {
    fn from(error: postgres::Error) -> Self {
        Self::SqlxError(error)
    }
}

impl From<figment::Error> for Error {
    fn from(error: figment::Error) -> Self {
        Self::FigmentError(error)
    }
}

impl From<url::ParseError> for Error {
    fn from(error: url::ParseError) -> Self {
        Self::Url(error)
    }
}

impl From<cache::CacheError> for Error {
    fn from(error: cache::CacheError) -> Self {
        Self::CacheError(error)
    }
}

impl From<tonic::transport::Error> for Error {
    fn from(error: tonic::transport::Error) -> Self {
        Self::TonicTransportError(error)
    }
}

impl From<tonic::Status> for Error {
    fn from(error: tonic::Status) -> Self {
        Self::TonicStatus(error)
    }
}

pub type Result<T> = std::result::Result<T, Error>;

impl IntoResponse for Error {
    #[tracing::instrument(skip_all)]
    fn into_response(self) -> Response {
        error!(error=?self);

        match self {
            Self::SqlxError(postgres::Error::RowNotFound) => StatusCode::NOT_FOUND.into_response(),
            Self::Unauthorized => StatusCode::UNAUTHORIZED.into_response(),
            Self::Timeout => StatusCode::REQUEST_TIMEOUT.into_response(),
            Self::Conflict(data) => (StatusCode::CONFLICT, data).into_response(),
            Self::SqlxError(postgres::Error::Database(err))
                if err.code() == Some("23505".into()) =>
            {
                StatusCode::CONFLICT.into_response()
            }
            Self::InvalidIndicatorKind(kind) => (
                StatusCode::UNPROCESSABLE_ENTITY,
                format!("Indicator data is not a valid {kind:?}"),
            )
                .into_response(),
            _ => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
        }
    }
}

impl From<sources::Error> for Error {
    fn from(error: sources::Error) -> Self {
        match error {
            sources::Error::NotFound => Self::NotFound,
            sources::Error::Unauthorized => Self::Unauthorized,
            sources::Error::RateLimited => Self::RateLimited,
            sources::Error::ResponseError => Self::ResponseError,
            sources::Error::Timeout => Self::Timeout,
            sources::Error::InternalError => Self::InternalError,
            sources::Error::IoError(err) => Self::IoError(err),
            sources::Error::MissingSourceCode => Self::MissingSourceCode,
            sources::Error::TonicTransportError(err) => Self::TonicTransportError(err),
            sources::Error::TonicStatus(err) => Self::TonicStatus(err),
            sources::Error::Postgres(err) => Self::SqlxError(err),
            sources::Error::Reqwest(err) => Self::Reqwest(err),
            sources::Error::InvalidHeaderValue(err) => Self::InvalidHeaderValue(err),
            sources::Error::ZipError(err) => Self::ZipError(err),
        }
    }
}
