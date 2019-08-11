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
					context: vscode.ReferenceContext, cancelToken: vscode.CancellationToken,
      ): Promise<vscode.Location[]> {
	if (cancelToken.isCancellationRequested) return [];
        context;
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
