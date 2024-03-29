mod runner {
    tonic::include_proto!("runner");
}

use std::{
    collections::BTreeMap,
    sync::{Arc, Mutex},
};

pub use runner::*;
use tonic::{Request, Response, Status};

pub mod config;

pub trait Validator
where
    Self: Sized,
{
    fn validate_inner(&self) -> Option<&str>;
    fn validate(self) -> Result<Self, tonic::Status> {
        if let Some(err) = self.validate_inner() {
            return Err(tonic::Status::invalid_argument(err));
        }

        Ok(self)
    }
}

impl Validator for runner::FetchDataRequest {
    fn validate_inner(&self) -> Option<&str> {
        if let Some(indicator) = &self.indicator {
            if indicator.data.is_empty() {
                return Some("indicator data is required");
            }

            if indicator.kind.is_empty() {
                return Some("indicator kind is required");
            }
        } else {
            return Some("indicator is required");
        }

        if self.source.is_empty() {
            return Some("sources is required");
        }

        None
    }
}

impl Validator for runner::BackgroundTaskRequest {
    fn validate_inner(&self) -> Option<&str> {
        if self.source.is_empty() {
            return Some("source is required");
        }

        None
    }
}

impl Validator for runner::UpdateRequest {
    fn validate_inner(&self) -> Option<&str> {
        if self.source.is_empty() {
            return Some("source is required");
        }

        if self.source_code.is_empty() {
            return Some("source_code is required");
        }

        None
    }
}

impl Validator for runner::InitRequest {
    fn validate_inner(&self) -> Option<&str> {
        self.updates.iter().find_map(|a| a.validate_inner())
    }
}

#[derive(Default, Debug)]
pub struct SourceCodeMapping(Arc<Mutex<BTreeMap<String, String>>>);

impl SourceCodeMapping {
    fn insert(&self, update_request: UpdateRequest) -> Result<(), tonic::Status> {
        self.0
            .lock()
            .map_err(|_| tonic::Status::internal("failed to lock source code mapping".to_string()))?
            .insert(update_request.source, update_request.source_code);

        Ok(())
    }

    fn bulk_insert(&self, data: Vec<UpdateRequest>) -> Result<(), tonic::Status> {
        self.0
            .lock()
            .map_err(|_| tonic::Status::internal("failed to lock source code mapping".to_string()))?
            .extend(BTreeMap::from_iter(
                data.into_iter().map(|a| (a.source, a.source_code)),
            ));

        Ok(())
    }

    pub fn get(&self, source: &str) -> Result<String, tonic::Status> {
        let binding = self.0.lock().map_err(|_| {
            tonic::Status::internal("failed to lock source code mapping".to_string())
        })?;

        binding
            .get(source)
            .map(|a| a.clone())
            .ok_or_else(|| tonic::Status::not_found(format!("source {} not found", source)))
    }
}

pub fn handle_update(
    source_code: &SourceCodeMapping,
    request: Request<UpdateRequest>,
) -> Result<Response<Empty>, Status> {
    let data = request.into_inner().validate()?;
    source_code.insert(data)?;

    Ok(Response::new(Empty {}))
}

pub fn handle_init(
    source_code: &SourceCodeMapping,
    request: Request<InitRequest>,
) -> Result<Response<Empty>, Status> {
    let data = request.into_inner().validate()?;
    source_code.bulk_insert(data.updates)?;

    Ok(Response::new(Empty {}))
}

impl From<String> for runner::FetchDataReply {
    fn from(data: String) -> Self {
        runner::FetchDataReply { data }
    }
}
