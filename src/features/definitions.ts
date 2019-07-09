/*
  This code is modeled off of
  vscode/extensions/typescript-language-features/src/features/definitions.ts
*/

import * as vscode from "vscode";
import { getDefinitionNodeFromSolcNode, LspManager } from "solc-lsp";

export function registerDefinition(lspMgr: LspManager) {
  vscode.languages.registerDefinitionProvider(
    { scheme: "file", language: "solidity" },
    {
      provideDefinition(document: vscode.TextDocument, position: vscode.Position
        // token: vscode.CancellationToken
      ) {
        const filePath = document.uri.fsPath;
        const tup = lspMgr.solcAstNodeFromLineColPosition(filePath, position);
        if (!tup) return [];
        const finfo = tup[0];
        const queryNode = tup[1];
        const defNode = getDefinitionNodeFromSolcNode(finfo.staticInfo, queryNode);
        if (defNode === null) return [];
        const originSelectionRange = finfo.sourceMapping.lineColRangeFromSrc(queryNode.src,
          0, 0);
        const targetRange = finfo.sourceMapping.lineColRangeFromSrc(defNode.src, 0, 0);
        return [<vscode.DefinitionLink>{
          originSelectionRange,
          targetRange,
          targetUri: document.uri, /* FIXME: Not quite right */

        }];
      }
    });
}
