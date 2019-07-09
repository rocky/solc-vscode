import * as vscode from "vscode";
import { getTypeDefinitionNodeFromSolcNode, LspManager } from "solc-lsp";

export function registerTypeDefinition(lspMgr: LspManager) {
  vscode.languages.registerTypeDefinitionProvider(
    { scheme: "file", language: "solidity" },
    {
      provideTypeDefinition(document: vscode.TextDocument, position: vscode.Position,
        // token: vscode.CancellationToken
      ) {
        const filePath = document.uri.fsPath;
        const tup = lspMgr.solcAstNodeFromLineColPosition(filePath, position);
        if (!tup) return [];
        const finfo = tup[0];
        const queryNode = tup[1];
        const defNode = getTypeDefinitionNodeFromSolcNode(finfo.staticInfo, queryNode);
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
