use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use strum::Display;
use tracing::error;

use crate::schemas::IndicatorKind;

#[derive(Debug, Display)]
pub enum Error {
    InvalidIndicatorType {
        kind: String,
        supported_indicators: Vec<String>,
    },
    RequestError(reqwest::Error),
    ZipError(zip::result::ZipError),
    ResponseError,
    IoError(std::io::Error),
    SqlxError(sqlx::Error),
    NotFound,
    Unauthorized,
    Timeout,
    InternalError,
    MissingSourceCode,
    RateLimited,
    FigmentError(figment::Error),
    InvalidConfig(String),
    Conflict(String),
    Crypto(chacha20poly1305::Error),
    InvalidIndicatorKind(IndicatorKind),
    Url(url::ParseError),
    CacheError(cache::CacheError),
    InvalidHeaderValue(reqwest::header::InvalidHeaderValue),
    TonicTransportError(tonic::transport::Error),
    TonicStatus(tonic::Status),
}

impl std::error::Error for Error {}

impl From<reqwest::Error> for Error {
    fn from(error: reqwest::Error) -> Self {
        Self::RequestError(error)
    }
}

impl From<zip::result::ZipError> for Error {
    fn from(error: zip::result::ZipError) -> Self {
        Self::ZipError(error)
    }
}

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Self::IoError(error)
    }
}

impl From<sqlx::Error> for Error {
    fn from(error: sqlx::Error) -> Self {
        Self::SqlxError(error)
    }
}

impl From<figment::Error> for Error {
    fn from(error: figment::Error) -> Self {
        Self::FigmentError(error)
    }
}

impl From<chacha20poly1305::Error> for Error {
    fn from(error: chacha20poly1305::Error) -> Self {
        Self::Crypto(error)
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

impl From<reqwest::header::InvalidHeaderValue> for Error {
    fn from(error: reqwest::header::InvalidHeaderValue) -> Self {
        Self::InvalidHeaderValue(error)
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
            Self::SqlxError(sqlx::Error::RowNotFound) => StatusCode::NOT_FOUND.into_response(),
            Self::Unauthorized => StatusCode::UNAUTHORIZED.into_response(),
            Self::Timeout => StatusCode::REQUEST_TIMEOUT.into_response(),
            Self::Conflict(data) => (StatusCode::CONFLICT, data).into_response(),
            Self::SqlxError(sqlx::Error::Database(err)) if err.code() == Some("23505".into()) => {
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
