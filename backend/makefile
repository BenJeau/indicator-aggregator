reset_db:
	./scripts/reset_db.sh && make gen_types

gen_types:
	typeshare ./ --lang=typescript --output-file=../indicator_aggregator_ui/src/types/backendTypes.ts