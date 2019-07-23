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
      provideDefinition(document: vscode.TextDocument, position: vscode.Position,
			                  cancelToken: vscode.CancellationToken
                       ) {
	      if (cancelToken.isCancellationRequested) return [];
        /* FIXME: DRY with type-definition.ts code */
        const filePath = document.uri.fsPath;
        const tup = lspMgr.solcAstNodeFromLineColPosition(filePath, position);
        if (!tup) return [];
        const finfo = tup[0];
        const queryNode = tup[1];
        const defNode = getDefinitionNodeFromSolcNode(finfo.staticInfo, queryNode);
        if (defNode === null) return [];
        const originSelectionRange = finfo.sourceMapping.lineColRangeFromSrc(queryNode.src,
                                                                             0, 0);
        // FIXME: encapsulate the below in a function
        const targetRange = finfo.sourceMapping.lineColRangeFromSrc(defNode.src, 0, 0);
        const defPath = finfo.sourceList[defNode.src.split(":")[2]]

        if (!(originSelectionRange && defPath)) return [];
        return [<vscode.DefinitionLink>{
          originSelectionRange,
          targetRange,
          targetUri: vscode.Uri.file(defPath)
        }];
      }
    });
}
