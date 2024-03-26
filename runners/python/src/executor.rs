use common::Indicator;
use pyo3::{
    types::{PyModule, PyTuple},
    PyResult, Python, ToPyObject,
};

fn execute_code<T, U>(
    source_code: &str,
    function: &str,
    args: impl IntoIterator<Item = T, IntoIter = U>,
) -> PyResult<String>
where
    T: ToPyObject,
    U: ExactSizeIterator<Item = T>,
{
    Python::with_gil(|py| {
        let code = PyModule::from_code(py, source_code, "", "")?;

        let args = PyTuple::new(py, args);
        code.getattr(function)?.call1(args)?.extract()
    })
}

pub fn fetch_data(source_code: &str, indicator: Indicator) -> PyResult<String> {
    execute_code(source_code, "fetch_data", &[indicator.data, indicator.kind])
}

pub fn background_task(source_code: &str) -> PyResult<String> {
    execute_code::<String, _>(source_code, "background_task", [])
}
