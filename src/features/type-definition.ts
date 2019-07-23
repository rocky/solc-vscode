import * as vscode from "vscode";
import { getTypeDefinitionNodeFromSolcNode, LspManager } from "solc-lsp";

export function registerTypeDefinition(lspMgr: LspManager) {
  vscode.languages.registerTypeDefinitionProvider(
    { scheme: "file", language: "solidity" },
    {
      provideTypeDefinition(document: vscode.TextDocument, position: vscode.Position,
			    cancelToken: vscode.CancellationToken

      ) {
	      if (cancelToken.isCancellationRequested) return [];
        /* FIXME: DRY with definition.ts code */
        const filePath = document.uri.fsPath;
        const tup = lspMgr.solcAstNodeFromLineColPosition(filePath, position);
        if (!tup) return [];
        const finfo = tup[0];
        const queryNode = tup[1];
        const defNode = getTypeDefinitionNodeFromSolcNode(finfo.staticInfo, queryNode);
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
