use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Validation};
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::{config, Result};

#[derive(Clone)]
pub struct JwtManager {
    decoding_key: DecodingKey,
    encoding_key: EncodingKey,
    validation: Validation,
    issuer: String,
    audience: String,
    expiration: u64,
}

impl JwtManager {
    pub fn new(config: &config::Jwt) -> Self {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.set_audience(&[&config.audience]);
        validation.set_issuer(&[&config.issuer]);
        validation.validate_exp = true;

        Self {
            decoding_key: DecodingKey::from_secret(config.secret.as_ref()),
            encoding_key: EncodingKey::from_secret(config.secret.as_ref()),
            validation,
            issuer: config.issuer.clone(),
            audience: config.audience.clone(),
            expiration: config.expiration,
        }
    }

    pub fn generate_jwt(&self, claims: Claims) -> Result<String> {
        let iat = chrono::Utc::now().to_utc().timestamp();

        let all_claims = AllClaims {
            iss: self.issuer.clone(),
            aud: self.audience.clone(),
            exp: iat + self.expiration as i64,
            iat,
            nbf: iat,
            data: claims,
        };

        jsonwebtoken::encode(
            &Default::default(),
            &serde_json::to_value(all_claims)?,
            &self.encoding_key,
        )
        .map_err(Into::into)
    }

    pub fn get_claims(&self, token: &str) -> Result<AllClaims> {
        jsonwebtoken::decode(token, &self.decoding_key, &self.validation)
            .map(|t| t.claims)
            .map_err(Into::into)
    }
}

/// JWT claims
#[derive(Serialize, Deserialize)]
#[typeshare]
pub struct Claims {
    /// Database ID of the user
    pub sub: String,
    /// Email of the user
    pub email: String,
    /// Whether the user has verified their email
    pub email_verified: Option<bool>,
    /// Name of the user
    pub name: String,
    /// First name of the user
    pub given_name: Option<String>,
    /// Last name of the user
    pub family_name: Option<String>,
    /// Locale of the user
    pub locale: Option<String>,
    /// Roles of the user granting access to parts of the platform
    pub roles: Vec<String>,
    /// Provider of the user
    pub provider: String,
}

#[derive(Serialize, Deserialize)]
pub struct AllClaims {
    pub iss: String,
    pub aud: String,
    pub exp: i64,
    pub iat: i64,
    pub nbf: i64,
    #[serde(flatten)]
    pub data: Claims,
}
