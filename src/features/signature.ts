/* A placeholder for a hover provider for Solidity */

import {
  CancellationToken,
  languages,
  Position,
  SignatureHelpContext, SignatureHelp, SignatureInformation,
  TextDocument
} from "vscode";

import {
  createFunctionParamsSnippet,
  getLineTextAndFinfo, endWordRegex
} from "./helper";

import { LspManager,
         // solcRangeFromLineColRange
       } from "solc-lsp";
// import { SolcAstNode } from "../solc-astview";

export function registerSoliditySignature(lspMgr: LspManager) {
  languages.registerSignatureHelpProvider(
    { scheme: "file", language: "solidity" },
    {
      provideSignatureHelp(document: TextDocument, position: Position,
		                       cancelToken: CancellationToken, context: SignatureHelpContext) {

        if (cancelToken.isCancellationRequested) return undefined;
        const filePath = document.uri.fsPath;
        if (filePath in lspMgr.fileInfo) {
          const [finfo, lineText] = getLineTextAndFinfo(lspMgr, document, position);
          const triggerOffset = position.character-1;
          const beforeTrigger = lineText.substr(0, triggerOffset);
          let beforeParen = beforeTrigger;
          if (context.triggerCharacter === ",") {
            const parenIndex = beforeTrigger.lastIndexOf("(");
            if (parenIndex > 0)
              beforeParen = beforeTrigger.substr(0, parenIndex);
            else
              return undefined;
          } else if (context.triggerCharacter !== "(")
            return undefined;

          const matches = beforeParen.match(endWordRegex);
          if (!matches) return undefined;
          const word = matches[0];
          const fns = finfo.staticInfo.fns;

          // FIXME: Fill this out more completely and remove the placeholder fakes
          let signatures: Array<SignatureInformation> = [];
          for (const fnName of Object.keys(fns)) {
            if (fnName.endsWith("." + word)) {
              const paramObj = createFunctionParamsSnippet(fns[fnName]);
              const sig = new SignatureInformation(fnName, paramObj.docStr);
              signatures.push(sig);
            }
          }

          let ret = new SignatureHelp();
		      ret.signatures = signatures;
		      ret.activeSignature = 0;
		      ret.activeParameter = 0;
          return ret;
        }
        return undefined;
      }
    },
    "(", ","  /* Trigger signature help of these characters */
  );
}
