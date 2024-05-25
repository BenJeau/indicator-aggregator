pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug)]
pub enum Error {
    NotProperlySetup,
    MissingRoles(Vec<String>),
    BadRequest(String),
    Unauthorized(String),
    SerdeJson(serde_json::Error),
    Reqwest(reqwest::Error),
    Database(database::Error),
    Jsonwebtoken(jsonwebtoken::errors::Error),
    PasswordHash(shared::crypto::PasswordHashError),
}

impl From<serde_json::Error> for Error {
    fn from(e: serde_json::Error) -> Self {
        Self::SerdeJson(e)
    }
}

impl From<reqwest::Error> for Error {
    fn from(e: reqwest::Error) -> Self {
        Self::Reqwest(e)
    }
}

impl From<database::Error> for Error {
    fn from(e: database::Error) -> Self {
        Self::Database(e)
    }
}

impl From<jsonwebtoken::errors::Error> for Error {
    fn from(e: jsonwebtoken::errors::Error) -> Self {
        Self::Jsonwebtoken(e)
    }
}

impl From<shared::crypto::PasswordHashError> for Error {
    fn from(e: shared::crypto::PasswordHashError) -> Self {
        Self::PasswordHash(e)
    }
}
