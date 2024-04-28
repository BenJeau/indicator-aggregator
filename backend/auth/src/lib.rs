pub mod config;
pub mod error;
pub mod google;
pub mod jwt;
pub mod microsoft;
pub mod middleware;
pub mod openid;

use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};

use error::{Error, Result};

pub fn require_roles(user_roles: &[&str], required_roles: &[&str]) -> Result<()> {
    let missing_roles = required_roles
        .iter()
        .filter(|role| !user_roles.contains(role))
        .map(|role| role.to_string())
        .collect::<Vec<_>>();

    if missing_roles.is_empty() {
        Ok(())
    } else {
        Err(Error::MissingRoles(missing_roles))
    }
}

pub fn generate_random_string(length: usize) -> String {
    thread_rng()
        .sample_iter(Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}
