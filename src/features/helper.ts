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
 * This contains utility functions used to support features
 */

import {
  Position,
  MarkdownString,
  TextDocument,
} from "vscode";

import {
  FileInfo,
  LspManager,
  Signature,
} from "solc-lsp";

export const endWordRegex = /[A-Za-z_][A-Za-z0-9_]*$/;

export function getLineTextAndFinfo(lspMgr: LspManager, document: TextDocument, position: Position): [FileInfo, string] {
  const text = document.getText();
  const lineTexts = text.split(/\r?\n/g);
  const lineText = lineTexts[position.line];
  const finfo = lspMgr.fileInfo[document.uri.path];
  return [finfo, lineText];
}

/* turn function/event parameters into a vscode Snippet and corresponding Markdown */
export function createFunctionParamsSnippet(signature: Signature) {
  const paramArray: Array<string> = [];
  const returnsDoc: Array<string> = [];
  const docArray: Array<string> = [];
  for (let i = 0; i < signature.params.length;) {
    const p = signature.params[i++];
    paramArray.push(`\$\{${i}:${p.paramName}\}`);
    docArray.push(`**${p.paramName}**: *${p.paramType}*`);
  }
  for (let i = 0; i < signature.returns.length;) {
    const p = signature.returns[i++];
    let markedStr = "";
    if (p.paramName) markedStr += `**${p.paramName}**:`;
    markedStr += `*${p.paramType}*`;
    returnsDoc.push(markedStr);
  }

  let docStr = docArray.join(", ");
  if (returnsDoc.length) {
    docStr += `\n\n**returns** ${returnsDoc.join(", ")}`;
  }
  return {
    paramStr: paramArray.join(", "),
    docStr: new MarkdownString(docStr)
  };
}
