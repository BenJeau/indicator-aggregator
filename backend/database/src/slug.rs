use once_cell::sync::Lazy;
use regex::Regex;

static SLUGIFY_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"[^a-z]+").expect("Invalid regex"));

pub fn slugify(s: &str) -> String {
    SLUGIFY_REGEX
        .split(&s.to_lowercase())
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_given_slug_when_slugify_return_unchanged() {
        let s = "hello-world";
        assert_eq!(slugify(s), s);
    }

    #[test]
    fn test_given_data_with_special_characters_when_slugify_return_data_without_special_characters()
    {
        assert_eq!(slugify("hello, world!?"), "hello-world");
    }

    #[test]
    fn test_given_data_with_mixed_case_when_slugify_return_data_in_lowercase() {
        assert_eq!(slugify("Hello, World"), "hello-world");
    }

    #[test]
    fn test_given_leading_and_trailing_spaces_when_slugify_return_data_without_trailing_spaces() {
        assert_eq!(slugify("   Hello    World    "), "hello-world");
    }

    #[test]
    fn test_given_leading_and_trailing_special_characters_when_slugify_return_data_without_special_characters(
    ) {
        assert_eq!(
            slugify("!)(|}{:\\/Hello__World?|};'098 wow^*"),
            "hello-world-wow"
        );
    }
}
