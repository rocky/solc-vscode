.PHONY: compile vscode all

#: "Build" this - really just an "npm install"
all:
	npm install

# Note: most things are just npm and the target name

#: Compile typescript to javascript
build: compile
compile:
	tsc --build

grammar:
	npm run grammar-from-yaml

#: Update vscode
vscode:
	npm run update-vscode

#: clear out node_modules
clean:
	rm -fr node_modules out || true
