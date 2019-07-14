import * as vscode from 'vscode';

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

  constructor(context: vscode.ExtensionContext,
              lspMgr: LspManager, astRoot: SolcAstNode | null) {
    const view = vscode.window.createTreeView("solcAstView", {
      treeDataProvider: this.aNodeWithIdTreeDataProvider(), showCollapseAll: true
    });
    this.lspMgr = lspMgr;
    this.astRoot = astRoot;
    context; view;
    // vscode.commands.registerCommand('testView.reveal', async () => {
    //   const key = await vscode.window.showInputBox({ placeHolder: 'Type the label of the item to reveal' });
    //   if (key) {
    //     await view.reveal(nodes[key], { focus: true, select: false, expand: true });
    //   }
    // });
  }


  getTreeItem(node: SolcAstNode): vscode.TreeItem2 {
    if (!node) return {
      label: <vscode.TreeItemLabel>{ label: "???", "foo": void 0},
      collapsibleState: vscode.TreeItemCollapsibleState.None
    };
    let key = node.nodeType;
    let highlights: Array<[number, number]> = [];
    if ("name" in node) {
      highlights = [[key.length+1, key.length + node.name.length + 1]]
      key += ` ${node.name}`;
    }
    return {
      label: <vscode.TreeItemLabel>{ label: key, highlights},
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
