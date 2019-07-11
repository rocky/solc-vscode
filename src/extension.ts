// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import {
  commands, /* workspace, WorkspaceFolder, */
  ExtensionContext
} from "vscode";
import * as vscode from "vscode";
// import { inspect } from "util";

import { registerSolidityHover } from "./features/hover";
import { registerDefinition } from "./features/definitions";
import { registerTypeDefinition } from "./features/type-definition";
import { registerReferences } from "./features/references";
import { compileActiveContract } from "./commands";
import { registerEvents } from "./events";

import { LspManager } from "solc-lsp";

const lspConfig = {};
const lspMgr = new LspManager(lspConfig);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {


  const diagnosticsCollection = vscode.languages.createDiagnosticCollection("Solidity");
  context.subscriptions.push(diagnosticsCollection);

  /* FIXME: these are done on the client side but may eventually be done on the LSP server side
   */
  context.subscriptions.push(commands.registerCommand("solidity.compile", () => {
    compileActiveContract(diagnosticsCollection, lspMgr);
  }));


    const provider1 = vscode.languages.registerCompletionItemProvider(
	{ scheme: "file", language: "text" },
	{
	    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

		document; position; token; context;

		// a simple completion item which inserts `Hello World!`
		const simpleCompletion = new vscode.CompletionItem('Hello World!');

		// a completion item that inserts its text as snippet,
		// the `insertText`-property is a `SnippetString` which we will
		// honored by the editor.
		const snippetCompletion = new vscode.CompletionItem('Good part of the day');
		snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

		// a completion item that can be accepted by a commit character,
		// the `commitCharacters`-property is set which means that the completion will
		// be inserted and then the character will be typed.
		const commitCharacterCompletion = new vscode.CompletionItem('console');
		commitCharacterCompletion.commitCharacters = ['.'];
		commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

		// a completion item that retriggers IntelliSense when being accepted,
		// the `command`-property is set which the editor will execute after
		// completion has been inserted. Also, the `insertText` is set so that
		// a space is inserted after `new`
		const commandCompletion = new vscode.CompletionItem('new');
		commandCompletion.kind = vscode.CompletionItemKind.Keyword;
		commandCompletion.insertText = 'new ';
		commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

		// return all completion items as array
		return [
		    simpleCompletion,
		    snippetCompletion,
		    commitCharacterCompletion,
		    commandCompletion
		];
	    }
	});

    const provider2 = vscode.languages.registerCompletionItemProvider(
	{ scheme: "file", language: "text" },
	{
	    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

		// get all text until the `position` and check if it reads `console.`
		// and iff so then complete if `log`, `warn`, and `error`
		let linePrefix = document.lineAt(position).text.substr(0, position.character);
		if (!linePrefix.endsWith('console.')) {
		    return undefined;
		}

		return [
		    new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
		    new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
		    new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
		];
	    }
	},
	'.' // triggered whenever a '.' is being typed
    );

  context.subscriptions.push(provider1, provider2);
  registerEvents(diagnosticsCollection, lspMgr);

  registerSolidityHover(lspMgr);
  registerDefinition(lspMgr);
  registerTypeDefinition(lspMgr);
  registerReferences(lspMgr);


  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "solidity-language-server" is now active!');

  // context.subscriptions.push(client);

}

// this method is called when your extension is deactivated
export function deactivate() {
    ; // Nothing here - move along
}
