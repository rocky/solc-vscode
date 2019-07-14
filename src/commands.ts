import * as path from "path";
import {
  window, /*workspace,*/
  Diagnostic,
  DiagnosticCollection,
  ExtensionContext,
  // Selection,
  Uri
} from "vscode";

import { LspManager } from "solc-lsp";
import { solcErrToDiagnostic } from "./diagnostics";
import { SolidityASTView } from "./solc-astview";

// // FIXME put into a function
// function selectionToRange(selection: Selection): Range {
//   return new Range(
//     selection.start.line + 1,
//     selection.start.character,
//     selection.end.line + 1,
//     selection.end.character
//   );
// }


export function compileActiveContract(diagnosticCollection: DiagnosticCollection,
                                      lspMgr: LspManager, context: ExtensionContext,
                                      warn: boolean) {

  const editor = window.activeTextEditor;
  if (!editor) {
    return; // We need something open
  }

  const fileName = editor.document.fileName;
  if (path.extname(fileName) !== ".sol") {
    if (warn) window.showWarningMessage(`${fileName} not a solidity file (*.sol)`);
    return;
  }

  /*
  // Check if is folder, if not stop we need to output to a bin folder on rootPath
  if (workspace.rootPath === undefined) {
  window.showWarningMessage("Please open a folder in Visual Studio Code as a workspace");
  return;
  }
  */

  const uri = Uri.file(fileName);
  const compiled = lspMgr.compile(editor.document.getText(), fileName, {});

  // Update ASTView if we have an ast.
  if ("sources" in compiled &&
      fileName in compiled.sources &&
      "ast" in compiled.sources[fileName]) {
    const solcAstRoot = compiled.sources[fileName].ast;
    new SolidityASTView(context, lspMgr, solcAstRoot);
  }

  diagnosticCollection.delete(uri);
  if (compiled.errors) {
    const diagnostics: Array<Diagnostic> = [];
    for (const compiledError of compiled.errors) {
      const diagnostic = solcErrToDiagnostic(compiledError);
      diagnostics.push(diagnostic);
      console.log(compiledError.formattedMessage);
    }
    diagnosticCollection.set(uri, diagnostics);
  }
  return;

}
