/*
  This code is modeled off of
  vscode/extensions/typescript-language-features/src/features/definitions.ts
*/

import * as vscode from "vscode";
import { getReferencesFromSolcNode, LspManager } from "solc-lsp";

export function registerReferences(lspMgr: LspManager) {
  vscode.languages.registerReferenceProvider(
    { scheme: "file", language: "solidity" },
    {
      // tslint:disable-next-line:object-literal-shorthand
      provideReferences: async function(document: vscode.TextDocument, position: vscode.Position,
        context: vscode.ReferenceContext, token: vscode.CancellationToken
        // token: vscode.CancellationToken
      ): Promise<vscode.Location[]> {
        context; token;
        const filePath = document.uri.fsPath;
        const tup = lspMgr.solcAstNodeFromLineColPosition(filePath, position);
        if (!tup) return [];
        const finfo = tup[0];
        const queryNode = tup[1];
        const useNodes = getReferencesFromSolcNode(finfo.staticInfo, queryNode);
        if (useNodes === null || useNodes.length === 0) return [];
        const locations: Array<vscode.Location> = [];
      for (const node of useNodes) {
          const lcRange = finfo.sourceMapping.lineColRangeFromSrc(node.src, 0, 0);
          const range = new vscode.Range(lcRange.start.line, lcRange.start.character,
            lcRange.end.line, lcRange.end.character);
          locations.push(new vscode.Location(document.uri, range));
        }
        return locations;
      }
    });
}
