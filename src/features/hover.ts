/* A placeholder for a hover provider for Solidity */

import * as vscode from "vscode";
import { LspManager,
         // solcRangeFromLineColRange
       } from "solc-lsp";
// import { SolcAstNode } from "../solc-astview";

export function registerSolidityHover(lspMgr: LspManager) {
  vscode.languages.registerHoverProvider(
    { scheme: "file", language: "solidity" },
    {
      provideHover(document: vscode.TextDocument, position: vscode.Position,
        cancelToken: vscode.CancellationToken) {
        const filePath = document.uri.fsPath;
        if (filePath in lspMgr.fileInfo) {
          const info = lspMgr.fileInfo[filePath];
          const staticInfo = info.staticInfo;

          // const editor = vscode.window.activeTextEditor;
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
              mess = `<${node.nodeType}>, type: ${node.typeName.name}`;
            } else if (node.typeDescriptions && node.typeDescriptions.typeString) {
              mess = `<${node.nodeType}>; type description: ${node.typeDescriptions.typeString}`;
            } else {
              mess = `<${node.nodeType}>`;
              // console.log(util.inspect(node));
            }
            return new vscode.Hover(mess);
          }
        }
        return undefined;
      }
    });
}
