import { compileActiveContract } from "./commands";
import {
        DiagnosticCollection, ExtensionContext,
} from "vscode";
import * as vscode from "vscode";

import { LspManager } from "solc-lsp";

export function registerEvents(diagnosticsCollection: DiagnosticCollection, lspMgr: LspManager,
                               context: ExtensionContext) {
    vscode.workspace.onDidChangeTextDocument(e => {
      compileActiveContract(diagnosticsCollection, lspMgr, context, false);
    e; // to make typescript happy
    // console.log(`XXX: ${inspect(e)}`);
  });

  vscode.workspace.onDidOpenTextDocument(e => {
    compileActiveContract(diagnosticsCollection, lspMgr, context, false);
    e; // to make typescript happy
    // console.log(`XXX: ${inspect(e)}`);
  });


}
