
test: lint
	@mocha -R spec

tolint := *.js *.json lib

lint:
	@jshint --verbose $(tolint)

.PHONY: test lint watch build less
