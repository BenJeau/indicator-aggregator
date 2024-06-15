use std::{
    env::current_dir,
    fs::{create_dir_all, File},
    io::Write,
    path::PathBuf,
};

use chrono::Local;

pub struct SourceFileWriter {
    directory: PathBuf,
}

impl SourceFileWriter {
    pub fn new() -> Self {
        let mut directory = current_dir().unwrap();
        directory.push(Local::now().naive_local().to_string());

        create_dir_all(&directory).unwrap();

        Self { directory }
    }

    pub fn write_source(&self, source: &str, data: &str) {
        let mut path = self.directory.clone();
        path.push(format!("{source}.json"));

        File::create(path)
            .unwrap()
            .write_all(data.as_bytes())
            .unwrap();
    }
}
