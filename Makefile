.PHONY: compile vscode all grammar grammar-lint

#: "Build" this - really just an "npm install"
all:
	npm install

# Note: most things are just npm and the target name

#: Compile typescript to javascript
build: compile
compile:
	tsc --build

# Create JSON syntax grammar from YAML
grammar: grammar-lint
	npm run grammar-from-yaml

#: Lint syntax grammar
grammar-lint:
	npm run grammar-lint

#: Update vscode
vscode:
	npm run update-vscode

#: clear out node_modules
clean:
	rm -fr node_modules out || true
