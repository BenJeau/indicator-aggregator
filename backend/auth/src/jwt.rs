use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Validation};
use serde::{Deserialize, Serialize};

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

#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub email: String,
    pub email_verified: Option<bool>,
    pub name: String,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub locale: Option<String>,
    pub roles: Vec<String>,
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
