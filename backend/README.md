# Backend

A multipurpose Rust backend doing the following:
  - Exposing a REST API server via [Axum](https://github.com/tokio-rs/axum/) interacting to PostreSQL via [SQLx](https://github.com/launchbadge/sqlx/)
    - Documented with OpenAPI with [utoipa](https://github.com/juhaku/utoipa)
  - Running background tasks for sources having background tasks defined

## Getting started

To run the backend locally, you'll need a PostgreSQL instance (to even build the backend you'll need it since SQLx's verifies queries at compile time unless `SQLX_OFFLINE=true` is defined) and have Rust installed then run the following:

```sh
cargo run
```

### Database migrations

You'll need to have the [SQLx CLI](https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md) installed and run the migrations with the following:

```sh
sqlx migrate run
```

> **Note**: you will need to have the `DATABASE_URL` environment variable properly defined either in the shell or in the `.env` file.

### Frontend types

Backend types used for the REST API are available for the TypeScript frontend thanks to [typeshare](https://github.com/1Password/typeshare) and can be created using the following command:

```sh
typeshare ./ --lang=typescript --output-file=../frontend/src/types/backendTypes.ts
```

Alternatively, both can be done via the Makefile command (which will revert the database migrations and apply the new migrations and generate the frontend types from the backend Rust structs):

```sh
make reset_db
```

## Configuration

[Figment](https://docs.rs/figment/latest/figment/) is used to define the configuration of the service. Default values are set within the [config.toml](./config.toml) file and all fields can be overwritten using environment variables starting with `INDICATOR_AGGREGATOR__` and have sections in uppercase and separated with double underscores `__`. For example, to change the server port to `7890` via an environment variable, you would use `INDICATOR_AGGREGATOR__SERVER__HTTP__PORT=7890` as variable.
