use tracing::instrument;
use validator::{validate_email, validate_ip_v4, validate_ip_v6, validate_url};

use crate::{
    hashing::{figure_hash_type, Hash},
    schemas::{Indicator, IndicatorKind},
    Error, Result,
};

#[instrument]
pub fn validate_hash(data: &str, expected_hash: Hash) -> bool {
    let Some(hash_type) = figure_hash_type(data) else {
        return false;
    };

    hash_type == expected_hash
}

#[instrument]
pub fn validate_domain(data: &str) -> bool {
    data.split('.').count() > 1 && data.split('.').all(|section| !section.is_empty())
}

impl Indicator {
    #[instrument(err)]
    pub fn validate(&self) -> Result<()> {
        let valid_data = match self.kind {
            IndicatorKind::Domain => validate_domain(&self.data),
            IndicatorKind::Ipv4 => validate_ip_v4(&self.data),
            IndicatorKind::Ipv6 => validate_ip_v6(&self.data),
            IndicatorKind::Url => validate_url(&self.data),
            IndicatorKind::Email => validate_email(&self.data),
            IndicatorKind::Sha1 => validate_hash(&self.data, Hash::Sha1),
            IndicatorKind::Sha256 => validate_hash(&self.data, Hash::Sha256),
            IndicatorKind::Sha512 => validate_hash(&self.data, Hash::Sha512),
            IndicatorKind::Md5 => validate_hash(&self.data, Hash::Md5),
            IndicatorKind::Tlsh => validate_hash(&self.data, Hash::Tlsh),
            IndicatorKind::Ssdeep => validate_hash(&self.data, Hash::Ssdeep),
        };

        if !valid_data {
            return Err(Error::InvalidIndicatorKind(self.kind));
        }

        Ok(())
    }
}
