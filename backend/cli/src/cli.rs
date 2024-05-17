use inquire::{error::InquireResult, Confirm, MultiSelect, Select, Text};

pub struct RequestData {
    pub data: String,
    pub kind: String,
    pub sources: Vec<String>,
    pub save_to_files: bool,
}

impl RequestData {
    pub fn request_from_cli(indicator_kinds: &[String], sources: &[String]) -> InquireResult<Self> {
        println!("requesting information from user ...");
        println!();

        let data = Text::new("indicator data:").prompt()?;
        let kind = Select::new("indicator kind:", indicator_kinds.into()).prompt()?;
        let sources = MultiSelect::new("sources:", sources.into())
            .prompt_skippable()?
            .unwrap_or_default();
        let save_to_files = Confirm::new("save to files? for each source, a JSON file would be created in a directory with the current date time").prompt()?;

        println!();

        Ok(Self {
            data,
            kind,
            sources,
            save_to_files,
        })
    }
}

pub fn print_banner() {
    println!(
        r#"  ___         _ _         _               _                               _              ___ _    ___ 
 |_ _|_ _  __| (_)__ __ _| |_ ___ _ _    /_\  __ _ __ _ _ _ ___ __ _ __ _| |_ ___ _ _   / __| |  |_ _|
  | || ' \/ _` | / _/ _` |  _/ _ \ '_|  / _ \/ _` / _` | '_/ -_) _` / _` |  _/ _ \ '_| | (__| |__ | | 
 |___|_||_\__,_|_\__\__,_|\__\___/_|   /_/ \_\__, \__, |_| \___\__, \__,_|\__\___/_|    \___|____|___|
                                             |___/|___/        |___/
"#
    );
}
