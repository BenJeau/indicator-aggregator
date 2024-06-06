# ![Indicator Aggregator Logo](./frontend/public/logo-small.png) Indicator Aggregator [![GitHub milestone details](https://img.shields.io/github/milestones/progress-percent/benjeau/indicator-aggregator/1?logo=github&label=V1%20Milestone)](https://github.com/BenJeau/indicator-aggregator/milestone/1)

[![GitHub Actions Workflow Status - Rust Compilation](https://img.shields.io/github/actions/workflow/status/BenJeau/indicator-aggregator/rust_check.yml?logo=github&label=Rust%20Compilation)](https://github.com/BenJeau/indicator-aggregator/actions/workflows/rust_check.yml)
[![GitHub Actions Workflow Status - TypeScript Compilation](https://img.shields.io/github/actions/workflow/status/BenJeau/indicator-aggregator/react_check.yml?logo=github&label=TypeScript%20Compilation)](https://github.com/BenJeau/indicator-aggregator/actions/workflows/react_check.yml)
[![GitHub Actions Workflow Status - Rustfmt Check](https://img.shields.io/github/actions/workflow/status/BenJeau/indicator-aggregator/rust_fmt.yml?logo=github&label=Rustfmt%20Check)](https://github.com/BenJeau/indicator-aggregator/actions/workflows/rust_fmt.yml)
[![GitHub Actions Workflow Status - Prettier Check](https://img.shields.io/github/actions/workflow/status/BenJeau/indicator-aggregator/react_fmt.yml?logo=github&label=Prettier%20Check)](https://github.com/BenJeau/indicator-aggregator/actions/workflows/react_fmt.yml)
[![GitHub Actions Workflow Status - Docker Compilation](https://img.shields.io/github/actions/workflow/status/BenJeau/indicator-aggregator/docker.yml?logo=github&label=Docker%20Compilation)](https://github.com/BenJeau/indicator-aggregator/actions/workflows/docker.yml)

A centralized platform aggregating various data sources with multiple nice add-on features. The backend is written in Rust and the frontend is in TypeScript using React.

This project is still in development and is not yet ready for production use. You can monitor the project's progress on the [project board](https://github.com/users/BenJeau/projects/6), by looking at the [issues](https://github.com/BenJeau/indicator-aggregator/issues), and [milestones](https://github.com/BenJeau/indicator-aggregator/milestones).

![Screenshot of the sources page of the frontend](./frontend/screenshot.png)

## Why centralized?

Centralizing external requests and responses allows for:
  * a normalized request handling (rate limiting, caching, proxying, …)
  * a common response format (error, success, timeouts,…)
  * a centralized caching mechanism
  * a global ignore list
  * built-in limit and quota management
  * secret management
  * background tasks
  * metrics/logs
  * authentication

By having all of these already built, creating a source is as simple as configuring it and writing the code needed to correlate the data. I've seen in my field many different ways this was handled, many of which were overly complicated due to:
* having duplicated code
* having multiple disconnected microservices (while it may seem like a good idea, it's not)
* having no centralization on any of the above

## Getting started

### Docker

The entire stack can be run using Docker with the following command:

```sh
docker compose up
```

By using docker compose, any changes in the frontend or backend will be hot reloaded - Rust will recompile and the frontend will use HMR.

### Local

Alternatively, you can spin up the stack locally by following the respective `README.md` files and by having access to a PostgreSQL server instance:
- [./backend/server/README.md](./backend/server/README.md)
- [./frontend/README.md](./frontend/README.md)

## CLI tool

Once you have the stack up either locally or remotely, you can use the simple CLI tool (a simple HTTP client of Indicator Aggregator) to query data from sources in an interactive manner (asking you for the data, kind of data, and to which sources to query). Run it with the following command:

```sh
cd backend
API_TOKEN=<INDICATOR_AGGREGATOR_API_TOKEN> BASE_URL=<INDICATOR_AGGREGATOR_BACKEND_SERVER_BASE_URL> cargo run --bin cli
```

## Architecture

Indicator Aggregator's architecture is defined at the [./docs/architecture.md](./docs/architecture.md) markdown file alongside other documents and diagrams.
