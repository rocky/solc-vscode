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

/*** These are copied from vscode.proposed.d.ts *******/
interface TreeItemLabel {

    /**
     * A human-readable string describing the [Tree item](#TreeItem).
     */
    label: string;

    /**
     * Ranges in the label to highlight. A range is defined as a tuple of two number where the
     * first is the inclusive start index and the second the exclusive end index
     */
    highlights?: [number, number][];

}

class TreeItem2 extends vscode.TreeItem {
    /**
     * Label describing this item. When `falsy`, it is derived from [resourceUri](#TreeItem.resourceUri).
     */
    label?: string | TreeItemLabel | /* for compilation */ any;

    /**
     * @param label Label describing this item
     * @param collapsibleState [TreeItemCollapsibleState](#TreeItemCollapsibleState) of the tree item. Default is [TreeItemCollapsibleState.None](#TreeItemCollapsibleState.None)
     */
    // constructor(label: TreeItemLabel, collapsibleState?: TreeItemCollapsibleState);
}

/***********************************************************/


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


  getTreeItem(node: SolcAstNode): TreeItem2 {
    if (!node) return {
      label: <TreeItemLabel>{ label: "???", "foo": void 0},
      collapsibleState: vscode.TreeItemCollapsibleState.None
    };
    let label: string = '';
    let highlights: Array<[number, number]> = [];
    if ("name" in node) {
      highlights = [[0, node.name.length]]
      label = `${node.name} ${node.nodeType}`;
    } else {
      label = node.nodeType;
    }
    return {
      label: <TreeItemLabel>{label, highlights},
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