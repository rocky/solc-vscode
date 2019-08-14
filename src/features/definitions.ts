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

import { CancellationToken, DefinitionLink, languages, Position, TextDocument, Uri } from "vscode";
import { getDefinitionNodeFromSolcNode, LspManager } from "solc-lsp";

export function registerDefinition(lspMgr: LspManager) {
  languages.registerDefinitionProvider(
    { scheme: "file", language: "solidity" },
    {
      provideDefinition(document: TextDocument, position: Position,
                        cancelToken: CancellationToken
                       ) {
        if (cancelToken.isCancellationRequested) return [];
        /* FIXME: DRY with type-definition.ts code */
        const filePath = document.uri.fsPath;
        const tup = lspMgr.solcAstNodeFromLineColPosition(filePath, position);
        if (!tup) return [];
        const finfo = tup[0];
        const queryNode = tup[1];
        const defNode = getDefinitionNodeFromSolcNode(finfo.staticInfo, queryNode);

        if (defNode === undefined) return [];
        const originSelectionRange = finfo.sourceMapping.lineColRangeFromSrc(queryNode.src,
                                                                             0, 0);
        // FIXME: encapsulate the below in a function
        const defPath = finfo.sourceList[defNode.src.split(":")[2]];
        const defFinfo = lspMgr.fileInfo[defPath];
        const targetRange = defFinfo.sourceMapping.lineColRangeFromSrc(defNode.src, 0, 0);

        if (!(originSelectionRange && defPath)) return [];

        return [<DefinitionLink>{
          originSelectionRange,
          targetRange,
          targetUri: Uri.file(defPath)
        }];
      }
    });
}
