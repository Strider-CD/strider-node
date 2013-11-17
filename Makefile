
test: lint

tolint := *.js *.json

lint:
	@./node_modules/.bin/jshint --verbose $(tolint)

.PHONY: test lint watch build less
