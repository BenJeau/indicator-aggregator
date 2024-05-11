FROM rust:1.78.0-slim-bookworm as builder-chef
RUN cargo install --version 0.1.66 cargo-chef
RUN apt-get update && apt-get install -y libpq-dev libssl-dev pkg-config protobuf-compiler python3-dev
WORKDIR /app

FROM builder-chef as planner
COPY . .
RUN cargo chef prepare  --recipe-path recipe.json

FROM builder-chef as builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN SQLX_OFFLINE=true cargo build --release

FROM debian:bookworm-20240408-slim
RUN apt-get update && apt-get install -y libpq-dev ca-certificates
COPY --from=builder /app/target/release/backend /

EXPOSE 3456

CMD [ "/backend" ]