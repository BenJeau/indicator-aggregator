use tracing::instrument;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Hash {
    Md5,
    Sha1,
    Sha256,
    Sha512,
    Ssdeep,
    Tlsh,
}

#[instrument(skip_all)]
pub fn figure_hash_type(hash: &str) -> Option<Hash> {
    let hash = hash.trim();
    let kind = match hash.len() {
        32 => Hash::Md5,
        40 => Hash::Sha1,
        64 => Hash::Sha256,
        128 => Hash::Sha512,
        72 if &hash[0..2] == "T1" && hash[2..].chars().all(|c| c.is_ascii_hexdigit()) => {
            return Some(Hash::Tlsh)
        }
        a if a > 10 && hash.split(':').count() == 3 => return Some(Hash::Ssdeep),
        _ => return None,
    };

    if !hash.chars().all(|c| c.is_ascii_hexdigit()) {
        return None;
    }

    Some(kind)
}
