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

import { solcCompileActive } from "./commands";
import {
        DiagnosticCollection, ExtensionContext,
} from "vscode";
import * as vscode from "vscode";

import { LspManager } from "solc-lsp";

export function registerEvents(diagnosticsCollection: DiagnosticCollection, lspMgr: LspManager,
                               context: ExtensionContext) {

  /* TODO: I tried putting this in a loop, but the Typescript typing mechanism is
     fighting me. */
  vscode.workspace.onDidChangeTextDocument(e => {
    solcCompileActive(diagnosticsCollection, lspMgr, context, false);
    e; // to make typescript happy
    // console.log(`XXX: ${inspect(e)}`);
  });

  vscode.window.onDidChangeActiveTextEditor(e => {
    solcCompileActive(diagnosticsCollection, lspMgr, context, false);
    e; // to make typescript happy
    // console.log(`XXX: ${inspect(e)}`);
  });

  vscode.workspace.onDidOpenTextDocument(e => {
    solcCompileActive(diagnosticsCollection, lspMgr, context, false);
    e; // to make typescript happy
    // console.log(`XXX: ${inspect(e)}`);
  });


}
