/* Copyright 2919 Rocky Bernstein

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  commands, /* workspace, WorkspaceFolder, */
  ExtensionContext,
  Position,
  TextDocument
} from "vscode";
import * as vscode from "vscode";
// import { inspect } from "util";

import { registerDefinition } from "./features/definitions";
import { registerSolidityHover } from "./features/hover";
import { registerSoliditySignature } from "./features/signature";
import {
  solcCompletionItemsProvider,
  solcCompletionItemsAfterDotProvider,
  solcCompletionItemsAfterLparenProvider,
  solcCompletionItemsAfterMapProvider
} from "./features/completions";
import { registerTypeDefinition } from "./features/type-definition";
import { registerReferences } from "./features/references";
import { solcDocstringThis, solcCompileActive, solcCompileActiveFull } from "./commands";
import { registerEvents } from "./events";
import { revealAST, SolidityASTView, TreeItem2 } from "./solc-astview";

import { LspManager } from "solc-lsp";

const lspMgr = new LspManager();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {


  /* We push on to "subscriptions" so that commands can have a "destroy" callback.

     Some the commands like "compile" right now are handled on the client side.
     Eventually we do more on the language-server or LSP side.
   */
  const diagnosticsCollection = vscode.languages.createDiagnosticCollection("Solidity");
  context.subscriptions.push(diagnosticsCollection);

  const astView = new SolidityASTView(context, lspMgr, undefined);

  commands.registerCommand("solidity.astView.selectNode", (item: TreeItem2) => {
    astView.selectTreeItemToggle(item);
  });

  context.subscriptions.push(commands.registerCommand("solidity.compile.quick", () => {
    solcCompileActive(diagnosticsCollection, lspMgr, context, true);
  }));

  context.subscriptions.push(commands.registerCommand("solidity.compile.full", () => {
    solcCompileActiveFull(diagnosticsCollection, lspMgr, context, true);
  }));

  context.subscriptions.push(commands.registerCommand("solidity.docstringThis", () => {
    solcDocstringThis(lspMgr);
  }));

  commands.registerCommand("solidity.revealAST", async () => {
    revealAST(lspMgr);
  });

  /****** IntelliSense command completion ***************************/
  vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "solidity" },
    { provideCompletionItems:
      function(document: TextDocument,
               position: Position, cancelToken: CancellationToken,
               context: CompletionContext): CompletionItem[] {
        return solcCompletionItemsProvider(lspMgr, document,  position, cancelToken,
                                           context);

      }
      // No resolveCompletionItem for now
    }
  );

  vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "solidity" },
    { provideCompletionItems:
      function(document: TextDocument,
               position: Position, cancelToken: CancellationToken,
               context: CompletionContext): CompletionItem[] {
        return solcCompletionItemsAfterDotProvider(lspMgr, document, position, cancelToken,
                                                   context);
      }
      // No resolveCompletionItem for now
    },
    "." // triggered whenever a '.' is being typed
  );

  vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "solidity" },
    { provideCompletionItems:
      function(document: TextDocument,
               position: Position, cancelToken: CancellationToken,
               context: CompletionContext): CompletionItem[] {
        return solcCompletionItemsAfterLparenProvider(lspMgr, document, position, cancelToken,
                                                      context);
      }
      // No resolveCompletionItem for now
    },
    "(" // triggered whenever a '(' is being typed
  );

  vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "solidity" },
    { provideCompletionItems:
      function(document: TextDocument,
               position: Position, cancelToken: CancellationToken,
               context: CompletionContext): CompletionItem[] {
        return solcCompletionItemsAfterMapProvider(lspMgr, document, position, cancelToken,
                                                   context);
      }
      // No resolveCompletionItem for now
    },
    ">" // => is not triggering, so use '>' and check on the other side.
  );

  // context.subscriptions.push(provider1, provider2);
  // provider1; provider2;

  /** FIXME: add completion item for docstring... */

  /****** End IntelliSense command completion ***********************/

  registerEvents(diagnosticsCollection, lspMgr, context);
  registerSolidityHover(lspMgr);
  registerSoliditySignature(lspMgr);
  registerDefinition(lspMgr);
  registerTypeDefinition(lspMgr);
  registerReferences(lspMgr);

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your Solidity extension, "solc-vscode", is now active!');

  // context.subscriptions.push(client);

}

// this method is called when your extension is deactivated
export function deactivate() {
  // Nothing here - move along
}
