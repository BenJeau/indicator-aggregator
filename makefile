install-deps-backend:
	cd backend && cargo install

install-deps-frontend:
	cd frontend && pnpm install

install-deps:
	parallel -u ::: "make install-deps-backend" "make install-deps-frontend"

run-backend:
	cd backend && cargo run --bin server

run-frontend:
	cd frontend && pnpm dev

run:
	parallel -u ::: "make run-backend" "make run-frontend"

start:
	make install-deps && make run

check-backend:
	cd backend && cargo check

check-frontend:
	cd frontend && pnpm check

check:
	parallel -u ::: "make check-backend" "make check-frontend"

fmt-backend:
	cd backend && cargo fmt --all

fmt-frontend:
	cd frontend && pnpm format

fmt:
	parallel -u ::: "make fmt-backend" "make fmt-frontend"

test-backend:
	cd backend && cargo test

test:
	parallel -u ::: "make test-backend"

lint-backend:
	cd backend && cargo clippy --all-targets -- -D warnings

lint-frontend:
	cd frontend && pnpm lint

lint:
	parallel -u ::: "make lint-backend" "make lint-frontend"

commit:
	parallel -u ::: "make check" "make fmt" "make lint"

db-changes:
	cd backend/database && cargo sqlx generate

db-create-migration:
	cd backend/database && cargo sqlx migrate add $1

db-reset:
	cd backend && make reset-db
