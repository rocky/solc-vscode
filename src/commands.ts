import * as path from "path";
import {
  Diagnostic,
  DiagnosticCollection,
  ExtensionContext,
  // Selection,
  Uri,
  window, /*workspace,*/
  workspace
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

const solcCompileQuickDefault = {
  settings: {
    optimizer: {
      enabled: false,
      runs: 0
    }
  }
}

export function solcCompileActive(diagnosticCollection: DiagnosticCollection,
                                 lspMgr: LspManager, context: ExtensionContext,
                                 warn: boolean, solcCompileSettings: any = {}) {

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
  const contracts_directory = path.basename(fileName);
  const settings = {...solcCompileQuickDefault, ...solcCompileSettings };
  const truffleConfSnippet = {
    contracts_directory,
    compilers: {
      solc: {
        version: workspace.getConfiguration("solidity")
          .get<string>("compileVersion"),
        settings
      }
    }
  };

  lspMgr.compile(editor.document.getText(), fileName, {},
                 truffleConfSnippet)
    .then((compiled: any) => {

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
    });
}

export function solcCompileActiveFull(diagnosticCollection: DiagnosticCollection,
                                      lspMgr: LspManager, context: ExtensionContext,
                                      warn: boolean, solcCompileSettings: any = {}) {
  const settings = {
    optimizer: {
      enabled: true,
      runs: 200
    },
    ... solcCompileSettings
  };
  solcCompileActive(diagnosticCollection, lspMgr, context, warn, settings);
}
