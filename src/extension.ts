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
import { solcCompletionItemsProvider,
         solcCompletionItemsProviderDot } from "./features/completions";
import { registerTypeDefinition } from "./features/type-definition";
import { registerReferences } from "./features/references";
import { compileActiveContract } from "./commands";
import { registerEvents } from "./events";
import { SolidityASTView } from "./solc-astview";

import { LspManager } from "solc-lsp";

const lspConfig = {};
const lspMgr = new LspManager(lspConfig);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {


  const diagnosticsCollection = vscode.languages.createDiagnosticCollection("Solidity");
  context.subscriptions.push(diagnosticsCollection);
  new SolidityASTView(context, lspMgr, null);

  /* FIXME: these are done on the client side but may eventually be done on the LSP server side
   */
  context.subscriptions.push(commands.registerCommand("solidity.compile", () => {
    compileActiveContract(diagnosticsCollection, lspMgr, context, true);
  }));


  // context.subscriptions.push(commands.registerCommand("solidity.reveal", async () => {
  //   const astIdStr = await vscode.window.showInputBox({ placeHolder: "Type the AST id of the item to reveal" });
  //   if (astIdStr) {
  //     const astId = parseInt(astIdStr, 10);
  //     debugger;
  //     astId;
  //     // await view.reveal(id2TreeViewNode[astId], { focus: true, select: false, expand: true });
  //   }
  // }));
  const provider1 = vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "solidity" }, solcCompletionItemsProvider);


  const provider2 = vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "solidity" }, solcCompletionItemsProviderDot,
    "." // triggered whenever a '.' is being typed
    );

  // FIXME: After we fix up to completion routines...
  // context.subscriptions.push(provider1, provider2);
  provider1; provider2;
  registerEvents(diagnosticsCollection, lspMgr, context);

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
    // Nothing here - move along
}
