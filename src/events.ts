import { compileActiveContract } from "./commands";
import {
  DiagnosticCollection,
} from "vscode";
import * as vscode from "vscode";

import { LspManager } from "solc-lsp";

export function registerEvents(diagnosticsCollection: DiagnosticCollection, lspMgr: LspManager) {
    vscode.workspace.onDidChangeTextDocument(e => {
      compileActiveContract(diagnosticsCollection, lspMgr, false);
    e; // to make typescript happy
    // console.log(`XXX: ${inspect(e)}`);
  });

  vscode.workspace.onDidOpenTextDocument(e => {
    compileActiveContract(diagnosticsCollection, lspMgr, false);
    e; // to make typescript happy
    // console.log(`XXX: ${inspect(e)}`);
  });


}
