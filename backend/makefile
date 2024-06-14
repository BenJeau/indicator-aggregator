db-reset:
	./scripts/reset_db.sh && make gen-types

gen-types:
	typeshare ./ --lang=typescript --output-file=../frontend/src/types/backendTypes.ts