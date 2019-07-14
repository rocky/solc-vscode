import * as vscode from 'vscode';

import {
  ExtensionContext
} from "vscode";

// FIXME: figure out how to export
export interface SolcAstNode {
  /* The following attributes are essential, and indicates an that object
     is an AST node. */
  readonly id: number;  // This is unique across all nodes in an AST tree
  readonly nodeType: string;
  readonly src: string;

  readonly absolutePath?: string;
  readonly exportedSymbols?: Object;
  readonly nodes?: Array<SolcAstNode>;
  readonly literals?: Array<string>;
  readonly file?: string;
  readonly scope?: number;
  readonly sourceUnit?: number;
  readonly symbolAliases?: Array<string>;
  readonly [x: string]: any;
  // These are filled in
  children?: Array<SolcAstNode>;
  parent?: SolcAstNode | null;
}



import { LspManager } from "solc-lsp";

export class SolidityASTView {

  astRoot: SolcAstNode | null;
  lspMgr: LspManager;

  constructor(context: ExtensionContext,
              lspMgr: LspManager, astRoot: SolcAstNode | null) {
    const view = vscode.window.createTreeView("solcAstView", {
      treeDataProvider: this.aNodeWithIdTreeDataProvider(), showCollapseAll: true
    });
    this.lspMgr = lspMgr;
    this.astRoot = astRoot;
    view; context;
  }


  getTreeItem(node: SolcAstNode): vscode.TreeItem2 {
    if (!node) return {
      label: <vscode.TreeItemLabel>{ label: "???", "foo": void 0},
      collapsibleState: vscode.TreeItemCollapsibleState.None
    };
    let label = `${node.nodeType} (${node.id})`;
    let highlights: Array<[number, number]> = [];
    if ("name" in node) {
      highlights = [[label.length+1, label.length + node.name.length + 1]]
      label += ` ${node.name}`;
    }
    return {
      label: <vscode.TreeItemLabel>{ label, highlights},
      tooltip: this.lspMgr.textFromSrc(node.src),
      collapsibleState: node && node.children && node.children.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    };
  }

  aNodeWithIdTreeDataProvider(): vscode.TreeDataProvider<SolcAstNode> {
    return {
      getChildren: (element: SolcAstNode): Array<SolcAstNode> => {
        return this.getChildren(element);
      },
      getTreeItem: (element: SolcAstNode): vscode.TreeItem => {
        const treeItem = this.getTreeItem(element);
        treeItem.id = element.key;
        return treeItem;
      },
      getParent: (element: SolcAstNode): SolcAstNode | null | undefined => {
        return element.parent;
      }
    };
  }

  getChildren(astItem: SolcAstNode): Array<SolcAstNode> {
    if (!astItem) {
      if (!this.astRoot) return [];
      astItem = this.astRoot;
    }
    if (astItem.children) return astItem.children;
    return [];
  }

}
