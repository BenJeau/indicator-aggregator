pub use chacha20poly1305::aead::Error;
use chacha20poly1305::{
    aead::{generic_array::GenericArray, Aead, OsRng, Result},
    AeadCore, KeyInit, XChaCha20Poly1305,
};
use rand::{distributions::Alphanumeric, thread_rng, Rng};
use tracing::instrument;

#[derive(Clone)]
pub struct Crypto {
    cipher: XChaCha20Poly1305,
}

impl Crypto {
    #[instrument(skip_all)]
    pub fn new<K: Into<String>>(key: K) -> Self {
        Self {
            cipher: XChaCha20Poly1305::new_from_slice(key.into().as_bytes()).unwrap(),
        }
    }

    #[instrument(skip_all, err)]
    pub fn encrypt<D: Into<String>>(&self, data: D) -> Result<Vec<u8>> {
        let nonce = XChaCha20Poly1305::generate_nonce(&mut OsRng);

        let ciphertext = self.cipher.encrypt(&nonce, data.into().as_bytes())?;

        let mut encrypted_data = Vec::with_capacity(nonce.len() + ciphertext.len());
        encrypted_data.extend_from_slice(&nonce);
        encrypted_data.extend_from_slice(&ciphertext);

        Ok(encrypted_data)
    }

    #[instrument(skip_all, err)]
    pub fn decrypt(&self, data: &[u8]) -> Result<String> {
        let (raw_nonce, ciphertext) = data.split_at(24);
        let nonce = GenericArray::from_slice(raw_nonce);

        let decrypted_data = self.cipher.decrypt(nonce, ciphertext)?;

        Ok(String::from_utf8_lossy(&decrypted_data).into())
    }

    #[instrument(skip_all)]
    pub fn generate_random_string(&self, length: usize) -> String {
        let mut rng = thread_rng();

        std::iter::repeat(())
            .map(|()| rng.sample(Alphanumeric))
            .map(char::from)
            .take(length)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_given_data_encrypting_data_can_be_decrypted() {
        let crypto = Crypto::new("oXcQAC8U@KNY8MvH@WhRV4vEMGpMbAvi");

        let data = "super_secret_data_to_save";

        let encrypted_data = crypto.encrypt(data).unwrap();
        let decrypted_data = crypto.decrypt(&encrypted_data.clone()).unwrap();

        assert_eq!(decrypted_data, data);
    }
}
