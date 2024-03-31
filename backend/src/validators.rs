use tracing::instrument;
use validator::{ValidateEmail, ValidateIp, ValidateUrl};

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
            IndicatorKind::Ipv4 => self.data.validate_ipv4(),
            IndicatorKind::Ipv6 => self.data.validate_ipv6(),
            IndicatorKind::Url => self.data.validate_url(),
            IndicatorKind::Email => self.data.validate_email(),
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
