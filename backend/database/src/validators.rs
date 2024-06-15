use tracing::instrument;
use validator::{ValidateEmail, ValidateIp, ValidateUrl};

use crate::{
    hashing::{figure_hash_type, Hash},
    schemas::indicators::{Indicator, IndicatorKind},
};

#[instrument]
fn validate_hash(data: &str, expected_hash: Hash) -> bool {
    figure_hash_type(data)
        .map(|hash_type| hash_type == expected_hash)
        .unwrap_or_default()
}

#[instrument]
fn validate_domain(data: &str) -> bool {
    data.contains('.') && data.split('.').all(|section| !section.is_empty())
}

impl Indicator {
    #[instrument]
    pub fn validate(&self) -> bool {
        match self.kind {
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
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    fn validate_helper(data: &str, kind: IndicatorKind) -> bool {
        Indicator {
            data: data.into(),
            kind,
        }
        .validate()
    }

    #[test]
    fn test_given_invalid_domain_when_validate_domain_then_false() {
        let invalid_domain = "domain";
        assert!(!validate_helper(invalid_domain, IndicatorKind::Domain));
    }

    #[test]
    fn test_given_valid_domain_when_validate_domain_then_true() {
        let valid_domain = "domain.com";
        assert!(validate_helper(valid_domain, IndicatorKind::Domain));
    }

    #[test]
    fn test_given_invalid_ipv4_when_validate_ipv4_then_false() {
        let invalid_ipv4 = "192.168.1";
        assert!(!validate_helper(invalid_ipv4, IndicatorKind::Ipv4));
    }

    #[test]
    fn test_given_valid_ipv4_when_validate_ipv4_then_true() {
        let valid_ipv4 = "1.1.1.1";
        assert!(validate_helper(valid_ipv4, IndicatorKind::Ipv4));
    }

    #[test]
    fn test_given_invalid_ipv6_when_validate_ipv6_then_false() {
        let invalid_ipv6 = "2001:0db8:85a3:0000:0000:8a2e";
        assert!(!validate_helper(invalid_ipv6, IndicatorKind::Ipv6));
    }

    #[test]
    fn test_given_valid_ipv6_when_validate_ipv6_then_true() {
        let valid_ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
        assert!(validate_helper(valid_ipv6, IndicatorKind::Ipv6));
    }

    #[test]
    fn test_given_invalid_url_when_validate_url_then_false() {
        let invalid_url = "example.com";
        assert!(!validate_helper(invalid_url, IndicatorKind::Url));
    }

    #[test]
    fn test_given_valid_url_when_validate_url_then_true() {
        let valid_url = "http://example.com";
        assert!(validate_helper(valid_url, IndicatorKind::Url));
    }

    #[test]
    fn test_given_invalid_email_when_validate_email_then_false() {
        let invalid_email = "example.com";
        assert!(!validate_helper(invalid_email, IndicatorKind::Email));
    }

    #[test]
    fn test_given_valid_email_when_validate_email_then_true() {
        let valid_email = "example@example.com";
        assert!(validate_helper(valid_email, IndicatorKind::Email));
    }

    #[test]
    fn test_given_invalid_sha1_when_validate_sha1_then_false() {
        let invalid_sha1 = "invalid_sha1";
        assert!(!validate_helper(invalid_sha1, IndicatorKind::Sha1));
    }

    #[test]
    fn test_given_valid_sha1_when_validate_sha1_then_true() {
        let valid_sha1 = "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8";
        assert!(validate_helper(valid_sha1, IndicatorKind::Sha1));
    }

    #[test]
    fn test_given_invalid_sha256_when_validate_sha256_then_false() {
        let invalid_sha256 = "invalid_sha256";
        assert!(!validate_helper(invalid_sha256, IndicatorKind::Sha256));
    }

    #[test]
    fn test_given_valid_sha256_when_validate_sha256_then_true() {
        let valid_sha256 = "6dcd4ce23d88e2ee95838f7b014b6284f1746b594b1f7c5436c6a00c38c2a123";
        assert!(validate_helper(valid_sha256, IndicatorKind::Sha256));
    }

    #[test]
    fn test_given_invalid_sha512_when_validate_sha512_then_false() {
        let invalid_sha512 = "invalid_sha512";
        assert!(!validate_helper(invalid_sha512, IndicatorKind::Sha512));
    }

    #[test]
    fn test_given_valid_sha512_when_validate_sha512_then_true() {
        let valid_sha512 = "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3aef53f5ca73b0f0f8";
        assert!(validate_helper(valid_sha512, IndicatorKind::Sha512));
    }

    #[test]
    fn test_given_invalid_md5_when_validate_md5_then_false() {
        let invalid_md5 = "invalid_md5";
        assert!(!validate_helper(invalid_md5, IndicatorKind::Md5));
    }

    #[test]
    fn test_given_valid_md5_when_validate_md5_then_true() {
        let valid_md5 = "098f6bcd4621d373cade4e832627b4f6";
        assert!(validate_helper(valid_md5, IndicatorKind::Md5));
    }

    #[test]
    fn test_given_invalid_tlsh_when_validate_tlsh_then_false() {
        let invalid_tlsh = "invalid_tlsh";
        assert!(!validate_helper(invalid_tlsh, IndicatorKind::Tlsh));
    }

    #[test]
    fn test_given_valid_tlsh_when_validate_tlsh_then_true() {
        let valid_tlsh = "T145D18407A78523B35A030267671FA2C2F725402973629B25545EB43C3356679477F7FC";
        assert!(validate_helper(valid_tlsh, IndicatorKind::Tlsh));
    }

    #[test]
    fn test_given_invalid_ssdeep_when_validate_ssdeep_then_false() {
        let invalid_ssdeep = "12345";
        assert!(!validate_helper(invalid_ssdeep, IndicatorKind::Ssdeep));
    }

    #[test]
    fn test_given_valid_ssdeep_when_validate_ssdeep_then_true() {
        let valid_ssdeep = "3:AXGBicFlgVNhBGcL6wCrFQEv:AXGHsVNhB2Lsr2C";
        assert!(validate_helper(valid_ssdeep, IndicatorKind::Ssdeep));
    }
}
