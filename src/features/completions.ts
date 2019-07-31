import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionTriggerKind,
  Position,
  TextDocument,
} from "vscode";

import { FileInfo, LspManager } from "solc-lsp";
// import { LanguageServiceHost } from "./types";

const solparse = require("solparse");

function getGlobalFunctionCompletions(finfo: FileInfo): CompletionItem[] {
  finfo;
  return [
    {
      detail: "assert(bool condition): throws if the condition is not met - to be used for internal errors.",
      insertText: "assert(${1:condition});",
      kind: CompletionItemKind.Function,
      label: "assert",
    },
    {
      detail: "require(bool condition): throws if the condition is not met - to be used for errors in inputs or external components.",
      insertText: "require(${1:condition});",
      kind: CompletionItemKind.Method,
      label: "require",
    },
    {
      detail: "revert(): abort execution and revert state changes",
      insertText: "revert();",
      kind: CompletionItemKind.Method,
      label: "revert",
    },
    {
      detail: "addmod(uint x, uint y, uint k) returns (uint):" +
        "compute (x + y) % k where the addition is performed with arbitrary precision and does not wrap around at 2**256",
      insertText: "addmod(${1:x},${2:y},${3:k})",
      kind: CompletionItemKind.Method,
      label: "addmod",
    },
    {
      detail: "mulmod(uint x, uint y, uint k) returns (uint):" +
        "compute (x * y) % k where the multiplication is performed with arbitrary precision and does not wrap around at 2**256",
      insertText: "mulmod(${1:x},${2:y},${3:k})",
      kind: CompletionItemKind.Method,
      label: "mulmod",
    },
    {
      detail: "keccak256(...) returns (bytes32):" +
        "compute the Ethereum-SHA-3 (Keccak-256) hash of the (tightly packed) arguments",
      insertText: "keccak256(${1:x})",
      kind: CompletionItemKind.Method,
      label: "keccak256",
    },
    {
      detail: "sha256(...) returns (bytes32):" +
        "compute the SHA-256 hash of the (tightly packed) arguments",
      insertText: "sha256(${1:x})",
      kind: CompletionItemKind.Method,
      label: "sha256",
    },
    {
      detail: "sha3(...) returns (bytes32):" +
        "alias to keccak256",
      insertText: "sha3(${1:x})",
      kind: CompletionItemKind.Method,
      label: "sha3",
    },
    {
      detail: "ripemd160(...) returns (bytes20):" +
        "compute RIPEMD-160 hash of the (tightly packed) arguments",
      insertText: "ripemd160(${1:x})",
      kind: CompletionItemKind.Method,
      label: "ripemd160",
    },
    {
      detail: "ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (address):" +
        "recover the address associated with the public key from elliptic curve signature or return zero on error",
      insertText: "ecrecover(${1:hash},${2:v},${3:r},${4:s})",
      kind: CompletionItemKind.Method,
      label: "ecrecover",
    },
  ];
}

function getGlobalVariableCompletions(finfo: FileInfo): CompletionItem[] {
  finfo;
  return [
    {
      detail: "Current block",
      kind: CompletionItemKind.Variable,
      label: "block",
    },
    {
      detail: "Current message",
      kind: CompletionItemKind.Variable,
      label: "msg",
    },
    {
      detail: "(uint): current block timestamp (alias for block.timestamp)",
      kind: CompletionItemKind.Variable,
      label: "now",
    },
    {
      detail: "Current transaction",
      kind: CompletionItemKind.Variable,
      label: "tx",
    },
  ];
}

function getTypeCompletions(finfo: FileInfo): CompletionItem[] {
  finfo;
  const types = ["address", "string", "bytes", "byte", "int", "uint", "bool", "hash"];
  return types.map(type => {
    const item = new CompletionItem(type, CompletionItemKind.Keyword);
    item.detail = type + " type";
    return item;
  });
}

function getUnitCompletions(): CompletionItem[] {
    const etherUnits = ["wei", "finney", "szabo", "ether"];
    const etherUnitCompletions = etherUnits.map(etherUnit => {
        const item = new CompletionItem(etherUnit, CompletionItemKind.Unit);
        item.detail = etherUnit + ": ether unit";
        return item;
    });

    const timeUnits = ["seconds", "minutes", "hours", "days", "weeks", "years"];
    const timeUnitCompletions = timeUnits.map(timeUnit => {
        const item = new CompletionItem(timeUnit, CompletionItemKind.Unit);
        item.detail = timeUnit + ": time unit";
        return item;
    });

    return etherUnitCompletions.concat(timeUnitCompletions);
}

export function getAllCompletions(finfo: FileInfo, text: string): CompletionItem[] {
  let result;
  try {
    result = solparse.parse(text);
  } catch (err) {
    return [];
  }
  const completionItems: CompletionItem[] = [];
  for (const element of result.body) {
    if (element.type !== "ContractStatement" && element.type !== "LibraryStatement") {
      continue;
    }
    if (typeof element.body === "undefined" || element.body === null) {
      continue;
    }
    const contractName = element.name;
    for (const contractElement of element.body) {
      switch (contractElement.type) {
        case "FunctionDeclaration":
          if (contractElement.name !== contractName) {
            completionItems.push(createFunctionEventCompletionItem(contractElement, "function", contractName));
          }
          break;
        case "EventDeclaration":
          completionItems.push(createFunctionEventCompletionItem(contractElement, "event", contractName));
          break;
        case "StateVariableDeclaration":
          const typeStr = typeStringFromLiteral(contractElement.literal);
          const completionItem = new CompletionItem(contractElement.name, CompletionItemKind.Field);
          completionItem.detail = "(state variable in " + contractName + ") " + typeStr + " " + contractElement.name;
          completionItems.push(completionItem);
          break;
      }
    }
  }

  const completions = [
    ...completionItems,
    ...getGlobalFunctionCompletions(finfo),
    ...getGlobalVariableCompletions(finfo),
    ...getTypeCompletions(finfo),
    ...getUnitCompletions()
  ];

  return completions;
}

const endWordRegex = /[A-Za-z_][A-Za-z0-9_]*$/;
/**
 * Find completions that can follow a ".". We use the word before as context for member names.
 *
 * @param lineText text of the line containing "."
 * @param dotOffset position of the dot to be matched
 * @returns the array of completion items that can follow <word>"."
 */
export function getCompletionsAfterDot(finfo: FileInfo, lineText: string, dotOffset: number): CompletionItem[] {
  const beforeDot = lineText.substr(0, dotOffset);
  const matches = beforeDot.match(endWordRegex);
  if (!matches) return [];;
  const word = matches[0];
  if (word === "block") {
    return getBlockCompletions();
  } else if (word === "msg") {
    return getMsgCompletions();
  } else if (word === "tx") {
    return getTxCompletions();
  } else if (word in finfo.staticInfo.enums) {
    return finfo.staticInfo.enums[word].map(e => {
      return {
        detail: `Enumeration literal of ${word}`,
        kind: CompletionItemKind.Enum,
        label: e
      }
    });
  } else if (word in finfo.staticInfo.array) {
    // FIXME: fill in
    return [];
  } else {
    return [];
  }
}

function createFunctionEventCompletionItem(contractElement: any, type: string, contractName: string): CompletionItem {
    const completionItem = new CompletionItem(contractElement.name, CompletionItemKind.Function);
    const paramsInfo = createParamsInfo(contractElement.params);
    const paramsSnippet = createFunctionParamsSnippet(contractElement.params);
    let returnParamsInfo = createParamsInfo(contractElement.returnParams);
    if (returnParamsInfo !== "") {
        returnParamsInfo = " returns (" + returnParamsInfo + ")";
    }
    const info = "(" + type + " in " + contractName + ") " + contractElement.name + "(" + paramsInfo + ")" + returnParamsInfo;

    completionItem.insertText = contractElement.name + "(" + paramsSnippet + ");";
    completionItem.documentation = info;
    completionItem.detail = info;
    return completionItem;
}

function typeStringFromLiteral(literal: any) {
    let isMapping = false;
    let suffixType = "";

    const literalType = literal.literal;
    if (typeof literalType.type !== "undefined") {
        isMapping = literalType.type === "MappingExpression";
        if (isMapping) {
            suffixType = "(" + typeStringFromLiteral(literalType.from) + " => " + typeStringFromLiteral(literalType.to) + ")";
        }
    }

    const isArray = literal.array_parts.length > 0;
    if (isArray) {
        suffixType = suffixType + "[]";
    }

    if (isMapping) {
        return "mapping" + suffixType;
    }

    return literalType + suffixType;
}

function createParamsInfo(params: any): string {
    if (typeof params === "undefined" || params === null) {
        return "";
    }

    let paramsInfo = "";
    for (const paramElement of params) {
        const typStr = typeStringFromLiteral(paramElement.literal);
        let currentParamInfo = "";
        if (typeof paramElement.id === "undefined" || paramElement.id === null) {
            currentParamInfo = typStr;
        } else {
            currentParamInfo = typStr + " " + paramElement.id;
        }
        if (paramsInfo === "") {
            paramsInfo = currentParamInfo;
        } else {
            paramsInfo = paramsInfo + ", " + currentParamInfo;
        }
    }
    return paramsInfo;
}

function createFunctionParamsSnippet(params: any): string {
    if (typeof params === "undefined" || params === null) {
        return "";
    }

    let paramsSnippet = "";
    let counter = 0;
    for (const paramElement of params) {
        counter = counter + 1;
        const currentParamSnippet = "${" + counter + ":" + paramElement.id + "}";
        if (paramsSnippet === "") {
            paramsSnippet = currentParamSnippet;
        } else {
            paramsSnippet = paramsSnippet + ", " + currentParamSnippet;
        }
    }
    return paramsSnippet;
}

function getBlockCompletions(): CompletionItem[] {
    return [
        {
            detail: "(address): Current block miner’s address",
            kind: CompletionItemKind.Property,
            label: "coinbase"
        },
        {
            detail: "(bytes32): Hash of the given block - only works for 256 most recent blocks excluding current",
            insertText: "blockhash(${1:blockNumber});",
            kind: CompletionItemKind.Method,
            label: "blockhash"
        },
        {
            detail: "(uint): current block difficulty",
            kind: CompletionItemKind.Property,
            label: "difficulty"
        },
        {
            detail: "(uint): current block gaslimit",
            kind: CompletionItemKind.Property,
            label: "gasLimit"
        },
        {
            detail: "(uint): current block number",
            kind: CompletionItemKind.Property,
            label: "number"
        },
        {
            detail: "(uint): current block timestamp as seconds since unix epoch",
            kind: CompletionItemKind.Property,
            label: "timestamp"
        }
    ];
}

function getTxCompletions(): CompletionItem[] {
    return [
        {
            detail: "(uint): gas price of the transaction",
            kind: CompletionItemKind.Property,
            label: "gas",
        },
        {
            detail: "(address): sender of the transaction (full call chain)",
            kind: CompletionItemKind.Property,
            label: "origin",
        },
    ];
}

function getMsgCompletions(): CompletionItem[] {
    return [
        {
            detail: "(bytes): complete calldata",
            kind: CompletionItemKind.Property,
            label: "data"
        },
        {
            detail: "(uint): remaining gas",
            kind: CompletionItemKind.Property,
            label: "gas"
        },
        {
            detail: "(address): sender of the message (current call)",
            kind: CompletionItemKind.Property,
            label: "sender"
        },
        {
            detail: "(bytes4): first four bytes of the calldata (i.e. function identifier)",
            kind: CompletionItemKind.Property,
            label: "sig"
        },
        {
            detail: "(uint): number of wei sent with the message",
            kind: CompletionItemKind.Property,
            label: "value"
        }
    ];
}

export function solcCompletionItemsProvider (lspMgr: LspManager, document: TextDocument,
                                             position: Position, cancelToken: CancellationToken,
                                             context: CompletionContext): CompletionItem[] {
  context;
  if (cancelToken.isCancellationRequested) return [];
  const text = document.getText();
  const lineTexts = text.split(/\r?\n/g);
  const lineText = lineTexts[position.line];
  const finfo = lspMgr.fileInfo[document.uri.path];
  return getAllCompletions(finfo, lineText);
}

export function solcCompletionItemsAfterDotProvider(lspMgr: LspManager, document: TextDocument,
                                                    position: Position, cancelToken: CancellationToken,
                                                    context: CompletionContext): CompletionItem[] {
  /* Something seems to be wrong in that we are not getting called back
     only on the trigger character, but always. So test context for TriggerCharacter
  */
  if (context.triggerKind !== CompletionTriggerKind.TriggerCharacter || context.triggerCharacter !== '.')
    return [];
  if (cancelToken.isCancellationRequested) return [];
  const text = document.getText();
  const lineText = text.split(/\r?\n/g)[position.line];
  const finfo = lspMgr.fileInfo[document.uri.path];
  return getCompletionsAfterDot(finfo, lineText, position.character-1);
}
