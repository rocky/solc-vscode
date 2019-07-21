.PHONY: compile vscode all grammar grammar-lint

#: "Build" this - really just an "npm install"
all:
	npm install

# Note: most things are just npm and the target name

#: Compile typescript to javascript
build: compile
compile:
	npx tsc --build

#: Lint syntax grammar
grammar:
	npm run grammar

#: Lint syntax grammar
grammar-lint:
	npm run grammar-lint

#: For developing and testing grammar JSSON
grammar-test:
	npm run grammar-test

#: Update vscode
vscode:
	npm run update-vscode

#: clear out node_modules
clean:
	rm -fr node_modules out || true

#: Start VSCode with proposed API extension for AST Tree Viewing
start:
	npm run start
