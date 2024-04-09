pub type Result<T> = std::result::Result<T, Error>;

pub use zip::result::ZipError;

#[derive(Debug, strum::Display)]
pub enum Error {
    NotFound,
    Unauthorized,
    RateLimited,
    ResponseError,
    MissingSourceCode,
    Timeout,
    InternalError,
    Postgres(database::Error),
    Reqwest(reqwest::Error),
    ZipError(ZipError),
    IoError(std::io::Error),
    InvalidHeaderValue(reqwest::header::InvalidHeaderValue),
    TonicTransportError(tonic::transport::Error),
    TonicStatus(tonic::Status),
}

impl std::error::Error for Error {}

impl From<database::Error> for Error {
    fn from(e: database::Error) -> Self {
        Self::Postgres(e)
    }
}

impl From<reqwest::Error> for Error {
    fn from(e: reqwest::Error) -> Self {
        Self::Reqwest(e)
    }
}

impl From<ZipError> for Error {
    fn from(error: ZipError) -> Self {
        Self::ZipError(error)
    }
}

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Self::IoError(error)
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
