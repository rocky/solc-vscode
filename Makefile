.PHONY: compile vscode all

all:
	npm install

build: compile
compile:
	tsc --build

#: Update vscode
vscode:
	npm run update-vscode

#: clear out node_modules
clean:
	rm -fr node_modules
