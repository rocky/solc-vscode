import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionTriggerKind,
  MarkdownString,
  Position,
  SnippetString,
  TextDocument,
} from "vscode";

import {
  FileInfo, LspManager, StaticInfo
} from "solc-lsp";
// import { LanguageServiceHost } from "./types";


/* turn function/event parameters into a vscode Snippet and corresponding Markdown */
function createFunctionParamsSnippet(params: Array<{paramName: string, paramType: string}>):
{paramStr: string, docStr: MarkdownString} {
  let paramArray: Array<string> = [];
  let docArray: Array<string> = [];
  for (let i=0; i < params.length;) {
    const p = params[i++];
    paramArray.push(`\$\{${i}:${p.paramName}\}`);
    docArray.push(`**${p.paramName}**: *${p.paramType}*`);
  }
  return {
    paramStr: paramArray.join(", "),
    docStr: new MarkdownString(docArray.join(", "))
  };
}

function getFunctionCompletions(staticInfo: StaticInfo): CompletionItem[] {
  const result: Array<CompletionItem> = [];
  for (const contractFnName in staticInfo.fns) {
	  const [contractName, fnName] = contractFnName.split(".");
    const params = staticInfo.fns[contractFnName].params;
    const paramObj = createFunctionParamsSnippet(params);
    result.push({
      detail: `${contractName} function`,
      documentation: paramObj.docStr,
      kind: CompletionItemKind.Function,
      insertText: new SnippetString(`${fnName}(${paramObj.paramStr})`),
      label: contractFnName
    });
  };
  return result;
}

function getGlobalFunctionCompletions(): CompletionItem[] {
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

const globalBuiltinVariableCompletions = [
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

function getGlobalVariableCompletions(): CompletionItem[] {
  return globalBuiltinVariableCompletions;
}

function getVariableDeclarationCompletions(staticInfo: StaticInfo): CompletionItem[] {
  if (!("VariableDeclaration" in staticInfo.nodeType))
  return [];
  return (<Array<string>>Array.from(staticInfo.nodeType.VariableDeclaration.values()))
    .map((varName: string) => {
      return {
        detail: "variable",
        kind: CompletionItemKind.Variable,
        label: varName
      }
    })
}

const builtinTypes = ["address", "string", "byte",
                      "bytes",  "bytes1", "bytes2", "bytes4", "bytes32", // skip bytes5..32, etc.
                      "int", "int8", "int16", "int32", "int64", "int128", "int256",  // skip other ints
                      "uint", "uint8", "uint16", "uint32", "uint64", "uint128", "uint256", // skip other units
                      "bool", "hash"
                     ]

const builtinTypeCompletions = builtinTypes.map(typeName => {
    return {
      detail: "built-in type",
      kind: CompletionItemKind.Keyword,
      label: typeName
    }
  });

function getTypeCompletions(finfo: FileInfo): CompletionItem[] {
  const staticInfo = finfo.staticInfo;
  const enumsDefined = Object.keys(staticInfo.enums).map(typeName => {
    return {
      detail: `User-defined enum type`,
      kind: CompletionItemKind.TypeParameter,
      label: typeName,
    }
  });
  const structsDefined = Object.keys(staticInfo.structs).map(typeName => {
    return {
      detail: `User-defined struct type`,
      label: typeName,
      kind: CompletionItemKind.TypeParameter
    };
  });

  return builtinTypeCompletions.concat(enumsDefined).concat(structsDefined);
}

/* What can go after map operator "=>".
   These are the same as type compiletions, but we want to add a space
   after "=>".
*/
function getMapCompletions(finfo: FileInfo): CompletionItem[] {
  const items = getTypeCompletions(finfo);
  for (const c of items) { c.label = " " + c.label }
  return items;
}

const etherUnits = ["wei", "finney", "szabo", "ether"];
const etherUnitCompletions = etherUnits.map(etherUnit => {
  return {
    detail: `built-in ether unit`,
    label: etherUnit,
    kind: CompletionItemKind.Unit
  };
});

const timeUnits = ["seconds", "minutes", "hours", "days", "weeks", "years"];
const timeUnitCompletions = timeUnits.map(timeUnit => {
  return {
    detail: `built-in time unit`,
    label: timeUnit,
    kind: CompletionItemKind.Unit
  }
});

const unitCompletions = etherUnitCompletions.concat(timeUnitCompletions);

export function getAllSolcCompletions(finfo: FileInfo): CompletionItem[] {
  const completions = [
    ...getFunctionCompletions(finfo.staticInfo),
    ...getGlobalFunctionCompletions(),
    ...getGlobalVariableCompletions(),
    ...getVariableDeclarationCompletions(finfo.staticInfo),
    ...getTypeCompletions(finfo),
    ...unitCompletions
  ];

  return completions;
}

const arrayMembers = ["length", "pop()", "push("].map(e => {
      return {
        detail: `${e}: array member`,
        kind: CompletionItemKind.Method,
        label: e
      }
});

const bytesMembers = ["pop()"].map(e => {
      return {
        detail: `${e}: bytes variable`,
        kind: CompletionItemKind.Method,
        label: e
      }
    });


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
    return finfo.staticInfo.enums[word].map((e: string) => {
      return {
        detail: `Enumeration literal of ${word}`,
        kind: CompletionItemKind.Enum,
        label: e
      }
    });
  } else if (word in finfo.staticInfo.structs) {
    return finfo.staticInfo.structs[word].map((e: string) => {
      return {
        detail: `Struct member of ${word}`,
        kind: CompletionItemKind.Field,
        label: e
      }
    });
  } else if (finfo.staticInfo.arrays.has(word)) {
    return arrayMembers;
  } else if (finfo.staticInfo.bytes.has(word)) {
    return bytesMembers;
  } else {
    return [];
  }
}


// function getTypeString(literal: any) {
//   const isArray = literal.array_parts.length > 0;
//   let isMapping = false;
//   const literalType = literal.literal;
//   let suffixType = '';

//   if (typeof literalType.type !== 'undefined')  {
//     isMapping = literalType.type === 'MappingExpression';
//     if (isMapping) {
//       suffixType = '(' + getTypeString(literalType.from) + ' => ' + getTypeString(literalType.to) + ')';
//     }
//   }

//   if (isArray) {
//     suffixType = suffixType + '[]';
//   }

//   if (isMapping) {
//     return 'mapping' + suffixType;
//   }

//   return literalType + suffixType;
// }

// Function createParamsInfo(params: Signature): string {
//   let paramsInfo = '';
//   if (typeof params !== 'undefined' && params !== null) {
//     if (params.hasOwnProperty('params')) {
//       params = params.params;
//     }
//     params.forEach( parameterElement => {
//       const typeString = getTypeString(parameterElement.literal);
//       let currentParamInfo = '';
//       if (typeof parameterElement.id !== 'undefined' && parameterElement.id !== null ) { // no name on return parameters
//         currentParamInfo = typeString + ' ' + parameterElement.id;
//       } else {
//         currentParamInfo = typeString;
//       }
//       if (paramsInfo === '') {
//         paramsInfo = currentParamInfo;
//       } else {
//         paramsInfo = paramsInfo + ', ' + currentParamInfo;
//       }
//     });
//   }
//   return paramsInfo;
// }


// function createFunctionEventCompletionItem(contractElement: any, type: string, contractName: string): CompletionItem {

//   const completionItem =  CompletionItem.create(contractElement.name);
//   completionItem.kind = CompletionItemKind.Function;
//   const paramsInfo = createParamsInfo(contractElement.params);
//   const paramsSnippet = createFunctionParamsSnippet(contractElement.params);
//   let returnParamsInfo = createParamsInfo(contractElement.returnParams);
//   if (returnParamsInfo !== '') {
//     returnParamsInfo = ' returns (' + returnParamsInfo + ')';
//   }
//   completionItem.insertTextFormat = 2;
//   completionItem.insertText = contractElement.name + '(' + paramsSnippet + ');';
//   const info = '(' + type + ' in ' + contractName + ') ' + contractElement.name + '(' + paramsInfo + ')' + returnParamsInfo;
//   completionItem.documentation = info;
//   completionItem.detail = info;
//   return completionItem;
// }

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

function getLineTextAndFinfo(lspMgr: LspManager, document: TextDocument, position: Position): [FileInfo, string] {
  const text = document.getText();
  const lineTexts = text.split(/\r?\n/g);
  const lineText = lineTexts[position.line];
  const finfo = lspMgr.fileInfo[document.uri.path];
  return [finfo, lineText];
}

export function solcCompletionItemsProvider (lspMgr: LspManager, document: TextDocument,
                                             position: Position, cancelToken: CancellationToken,
                                             context: CompletionContext): CompletionItem[] {
  context;
  if (cancelToken.isCancellationRequested) return [];
  const [finfo, lineText] = getLineTextAndFinfo(lspMgr, document, position);
  lineText;
  return getAllSolcCompletions(finfo);
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
  const [finfo, lineText] = getLineTextAndFinfo(lspMgr, document, position);
  return getCompletionsAfterDot(finfo, lineText, position.character-1);
}

export function solcCompletionItemsAfterMapProvider(lspMgr: LspManager, document: TextDocument,
                                                    position: Position, cancelToken: CancellationToken,
                                                    context: CompletionContext): CompletionItem[] {
  /* Something seems to be wrong in that we are not getting called back
     only on the trigger character, but always. So test context for TriggerCharacter
  */
  if (context.triggerKind !== CompletionTriggerKind.TriggerCharacter)
    return [];
  if (cancelToken.isCancellationRequested) return [];
  const [finfo, lineText] = getLineTextAndFinfo(lspMgr, document, position);
  if (lineText.substr(position.character-2, 2) != '=>') return [];
  return getMapCompletions(finfo);
}
