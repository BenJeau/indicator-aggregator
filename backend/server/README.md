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

Whenever you make modifications to the migrations or the SQL queries made within the codebase, you need to run the following in order for the build steps in CI to not need a live PostgreSQL instance:

```sh
cargo sqlx prepare
```

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

[Figment](https://docs.rs/figment/latest/figment/) is used to define the configuration of the service. Default values are set within the [config.toml](./config.toml) file and all fields can be overwritten using environment variables starting with `IOCAGG_` and have sections in uppercase and separated with double underscores `__`. For example, to change the server port to `7890` via an environment variable, you would use `IOCAGG_SERVER_HTTP_PORT=7890` as variable.

### Sentry

For Sentry.io to work correctly, you need to supply as environment variable the Sentry.io DSN via environment variable with `SENTRY_DSN`. Other values can be overriden as per the following documentation https://docs.sentry.io/platforms/rust/configuration/options/.
