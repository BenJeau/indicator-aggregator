use serde::Deserialize;

macro_rules! create_deserialize_fn {
    ($name:ident, $format:expr) => {
        pub fn $name<'de, D>(
            deserializer: D,
        ) -> std::result::Result<chrono::NaiveDateTime, D::Error>
        where
            D: serde::Deserializer<'de>,
        {
            let s = String::deserialize(deserializer)?;
            chrono::NaiveDateTime::parse_from_str(&s, $format).map_err(serde::de::Error::custom)
        }
    };
}

macro_rules! create_optional_deserialize_fn {
    ($name:ident, $format:expr) => {
        pub fn $name<'de, D>(
            deserializer: D,
        ) -> std::result::Result<Option<chrono::NaiveDateTime>, D::Error>
        where
            D: serde::Deserializer<'de>,
        {
            let s = String::deserialize(deserializer)?;
            if s.is_empty() {
                return Ok(None);
            }

            chrono::NaiveDateTime::parse_from_str(&s, $format)
                .map_err(serde::de::Error::custom)
                .map(Some)
        }
    };
}

const URL_HAUS_FORMAT: &str = "%Y-%m-%d %H:%M:%S";

create_deserialize_fn!(url_haus_deserialize, URL_HAUS_FORMAT);
create_optional_deserialize_fn!(url_haus_optional_deserialize, URL_HAUS_FORMAT);

const PHISH_TANK_FORMAT: &str = "%Y-%m-%dT%H:%M:%S%z";

create_deserialize_fn!(phish_tank_deserialize, PHISH_TANK_FORMAT);
