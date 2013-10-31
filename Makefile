
test: lint
	@mocha -R spec

tolint := *.js *.json

lint:
	@jshint --verbose $(tolint)

.PHONY: test lint watch build less
