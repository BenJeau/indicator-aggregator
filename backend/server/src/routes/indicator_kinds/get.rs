use axum::{response::IntoResponse, Json};
use database::schemas::indicators::IndicatorKind;
use strum::IntoEnumIterator;

use crate::Result;

/// Get all indicator kinds
#[utoipa::path(
    get,
    path = "/indicatorKinds",
    tag = "indicatorKinds",
    responses(
        (status = 200, description = "Indicator kinds retrieved successfully", body = [String]),
    ),
)]
pub async fn get_indicator_kinds() -> Result<impl IntoResponse> {
    let indicator_kinds: Vec<_> = IndicatorKind::iter().map(|i| i.to_string()).collect();

    Ok(Json(indicator_kinds))
}
