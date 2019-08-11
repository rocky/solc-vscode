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

import * as path from "path";
import * as Handlebars from 'handlebars';
import {
  Diagnostic,
  DiagnosticCollection,
  ExtensionContext,
  Position,
  // Selection,
  SnippetString,
  TextDocument,
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
  optimizer: {
    enabled: false,
    runs: 0
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
  const contracts_directory = path.dirname(fileName);
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

  const solcSourceCode = editor.document.getText();
  if (!solcSourceCode) return; // We need sourceCode
  const lineCount = (solcSourceCode.match(/\n/g) || "").length + 1;
  lspMgr.compile(solcSourceCode, fileName, truffleConfSnippet)
    .then((compiled: any) => {

      if (!compiled) {
        window.showErrorMessage(`solc compile of current editor failed with no trace diagnostic output`);
        return;
      }

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
          const diagnostic = solcErrToDiagnostic(compiledError, lineCount);
          diagnostics.push(diagnostic);
        }
        diagnosticCollection.set(uri, diagnostics);
      }
    })
    .catch(err => {
      window.showErrorMessage(`solc compile of current editor crashed with ${err}`);
    });
}

export function solcCompileActiveFull(diagnosticCollection: DiagnosticCollection,
                                      lspMgr: LspManager, context: ExtensionContext,
                                      warn: boolean, solcCompileSettings: any = {}) {
  const settings = {
    outputSelection: {
      "*": {
        "*": [ "*" ]
      }
    },
    optimizer: {
      enabled: true,
      runs: 200
    },
    ... solcCompileSettings
  };
  solcCompileActive(diagnosticCollection, lspMgr, context, warn, settings);
}

function getLineText(document: TextDocument, position: Position): string {
  const text = document.getText();
  const lineTexts = text.split(/\r?\n/g);
  return lineTexts[position.line];
}

/* Note: we leave out indentation in this template and will add that
   after this is expanded. */
const functionDocstringTemplate = `
/** @dev $1
{{#each parameters}}
  * @param {{name}} {{nextTabStop}}
{{/each}}
  *
{{#each returns}}
  * @return {{name}} {{nextTabStop}}
{{/each}}
  */`;

const contractTemplate = `/** @title $1 */
`;

// Compile the template
const functionDocstringTemplateC = Handlebars.compile(functionDocstringTemplate);

/**
 * Create a solc docstring (doxygen format) for the current selected position. We use solc's AST
 * node information to help us.
 *
 * @export
 * @param {LspManager} lspMgr Solc LSP Manager
 *
 */
export function solcDocstringThis(lspMgr: LspManager) {
  const editor = window.activeTextEditor;
  if (!editor) return;
  const selection = editor.selection;
  const filePath = editor.document.fileName;

  const info = lspMgr.fileInfo[filePath];
  const staticInfo = info.staticInfo;
  const position = selection.start;
  const solcOffset = info.sourceMapping.offsetFromLineColPosition(position);
  const node = staticInfo.offsetToAstNode(solcOffset);
  if (node) {
    const lineText = getLineText(editor.document, position);
    const insertPosition = new Position(position.line, 0);
    let indent: string; // (presumably) blanks before "contract" or "function"
    let snippetStr: string;
    if (node.nodeType === "FunctionDefinition") {
      const indentPos = lineText.indexOf("function");
      if (indentPos < 0) return;
      indent = lineText.substr(0, indentPos);
      const docData = {
        parameters: node.parameters.parameters,
        returns: node.returnParameters.parameters
      };
      try {
        let tabstop = 1;
        function nextTabStop(): string {
          tabstop++;
          return `\$\{${tabstop}:add description\}`;
        };
        Handlebars.registerHelper('nextTabStop', nextTabStop);
        /* handlebars will remove indentation on "each" iteration so we need to put
           indentation back here. */
        const snippetArray = functionDocstringTemplateC(docData).split(/\r?\n/g);
        snippetStr = indent + snippetArray.join("\n" + indent) + "\n";
      } catch {
        return;
      }
    } else if (node.nodeType === "ContractDefinition") {
      const indentPos = lineText.indexOf("contract");
      if (indentPos < 0) return
      indent = lineText.substr(0, indentPos);
      snippetStr = indent + contractTemplate;
    } else {
      window.showWarningMessage(`Current position needs to be at a function or contract definition`);
      return;
    }
    editor.insertSnippet(new SnippetString(snippetStr), insertPosition);
  } else {
      window.showWarningMessage(`Can't find AST node for current position`);
  }
}
