# Whatever it is you want to do, it should be forwarded to the
# to top-level directories
.PHONY: grammar

#: Default rule: Solidity Syntax Highlighing file (JSON) from com YAML source
grammar:
	$(MAKE) -C .. $@

#: Solidity Syntax Highlighing file (JSON) from com YAML source
solidity.json: solidity.yaml
	npm run grammar

%:
	$(MAKE) -C .. $@
