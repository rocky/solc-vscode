/* A placeholder for a hover provider for Solidity */

import {
  CancellationToken, Hover, languages, MarkdownString,
  Position, TextDocument
} from "vscode";
import { LspManager,
         // solcRangeFromLineColRange
       } from "solc-lsp";
// import { SolcAstNode } from "../solc-astview";

export function registerSolidityHover(lspMgr: LspManager) {
  languages.registerHoverProvider(
    { scheme: "file", language: "solidity" },
    {
      provideHover(document: TextDocument, position: Position,
        cancelToken: CancellationToken) {
        const filePath = document.uri.fsPath;
        if (filePath in lspMgr.fileInfo) {
          const info = lspMgr.fileInfo[filePath];
          const staticInfo = info.staticInfo;

          // const editor = window.activeTextEditor;
          // let node: SolcAstNode | null;
          // if (editor) {
          //   const solcRange = solcRangeFromLineColRange(editor.selection, lspMgr.fileInfo[filePath].sourceMapping.lineBreaks);
          //   node = staticInfo.solcRangeToAstNode(solcRange);
          // } else {
          //   const solcOffset = info.sourceMapping.offsetFromLineColPosition(position);
          //   node = staticInfo.offsetToAstNode(solcOffset);
          // }
          const solcOffset = info.sourceMapping.offsetFromLineColPosition(position);
          const node = staticInfo.offsetToAstNode(solcOffset);

          let mess: string;
          if (node) {
            if (cancelToken.isCancellationRequested) return undefined;
            if (node.typeName && node.typeName.name) {
              mess = `_${node.nodeType}_\n\n---\n\ntype: \`${node.typeName.name}\``;
            } else if (node.typeDescriptions && node.typeDescriptions.typeString) {
              mess = `_${node.nodeType}_\n\n---\n\ntype description: \`${node.typeDescriptions.typeString}\``;
            } else {
              mess = `_${node.nodeType}_`;
              // console.log(util.inspect(node));
            }
            return new Hover(new MarkdownString(mess));
          }
        }
        return undefined;
      }
    });
}
