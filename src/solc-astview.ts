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

import * as vscode from 'vscode';

import {
  Command,
  ExtensionContext,
  TreeItem,
  TreeItemCollapsibleState,
  window
} from "vscode";

import { solcRangeFromLineColRange } from "solc-lsp";

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

/* This should not be needed, but vscode isn't picking this stuff up */
export class TreeItem2 extends TreeItem {
    /**
     * Label describing this item. When `falsy`, it is derived from [resourceUri](#TreeItem.resourceUri).
     */
    label?: string | TreeItemLabel | /* for compilation */ any;
	  id?: string;
		collapsibleState?: TreeItemCollapsibleState;
		command?: Command;
		tooltip?: string | undefined;

  /**
     * @param label Label describing this item
     * @param collapsibleState [TreeItemCollapsibleState](#TreeItemCollapsibleState) of the tree item. Default is [TreeItemCollapsibleState.None](#TreeItemCollapsibleState.None)
     */
    // constructor(label: TreeItemLabel, collapsibleState?: TreeItemCollapsibleState);
}

/***********************************************************/


import { LspManager } from "solc-lsp";

// Keyed by external filename, we keep track of the ast Roots
const astRoots: any = {};

// create a decorator type that we use to show AST range associations
export const astRangeDecorationType = vscode.window.createTextEditorDecorationType({
	borderWidth: '1px',
	borderStyle: 'solid',
	overviewRulerColor: 'blue',
	overviewRulerLane: vscode.OverviewRulerLane.Right,
	light: {
		// this color will be used in light color themes
		borderColor: 'darkblue'
	},
	dark: {
		// this color will be used in dark color themes
		borderColor: 'lightblue'
	}
});

export class SolidityASTView {

  astRoot: SolcAstNode | null;
  lspMgr: LspManager;

  // Mapping from Solc AST id to solc AST node.
  id2Node: any = {};

  // Mapping from Solc AST id to Treeview AST node.
  id2TreeItem: any = {};

  // Last selected tree node. Used in toggling highlighted source region.
  lastSelected: string = '';

  constructor(context: ExtensionContext,
              lspMgr: LspManager, astRoot: SolcAstNode | null) {
    const view = vscode.window.createTreeView("solcAstView", {
      treeDataProvider: this.aNodeWithIdTreeDataProvider(),
      showCollapseAll: true,
    });
    this.lspMgr = lspMgr;
    this.astRoot = astRoot;
    if (astRoot !== null && astRoot.absolutePath !== undefined)
      astRoots[astRoot.absolutePath] = this;

    // Bogus use of variables to keep typescript compiler happy.
    view; context;

  }


  createTreeItem(node: SolcAstNode): TreeItem2 {
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

    const idStr = node.id.toString();
    this.id2Node[idStr] = node;
    const item: TreeItem2 = {
      label: <TreeItemLabel>{label, highlights},
      tooltip: this.lspMgr.textFromSrc(node.src),
      collapsibleState: (node && node.children && node.children.length)
        ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    };

    if (this.astRoot !== null) {
      item.id = `${idStr} ${this.astRoot.absolutePath}`;
    }

    item.command = {
      command: "solidity.astView.selectNode",
      title: "SelectNode",
      arguments: [item]
    }
    this.id2TreeItem[node.id] = item;
    return item;
  }

  aNodeWithIdTreeDataProvider(): vscode.TreeDataProvider<SolcAstNode> {
    return {
      getChildren: (element: SolcAstNode): Array<SolcAstNode> => {
        return this.getChildren(element);
      },
      getTreeItem: (element: SolcAstNode): vscode.TreeItem => {
        const treeItem = this.createTreeItem(element);
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

  selectTreeItemToggle(item: TreeItem2) {
    if (item.id === undefined) return;

    // FIXME: Don't assume activeTextEditor
	  const activeEditor = window.activeTextEditor;
    if (!activeEditor) return;

    // FIXME: Split should split on 1st blank only and preserve other blanks
    const [id, astRoot] = item.id.split(" ");

    if (!(astRoot in astRoots)) return;
    const self = astRoots[astRoot];
    if (self.lastSelected == item.id) {
		  activeEditor.setDecorations(astRangeDecorationType, []);
      self.lastSelected = null;
      return;
    }
    const node = self.id2Node[id];
    const fileIndex = node.src.split(":")[2];
    const filePath = self.lspMgr.fileInfo.sourceList[fileIndex];
    const finfo = self.lspMgr.fileInfo[filePath];
    const targetRange = finfo.sourceMapping.lineColRangeFromSrc(node.src, 0, 0);
		const decoration = { range: targetRange, hoverMessage: `Span for ${item.label.label}` };

		activeEditor.setDecorations(astRangeDecorationType, [decoration]);
    self.lastSelected = item.id;
  }

}

export function revealAST(lspMgr: LspManager) {
  /* FIXME: DRY with type-definition.ts code */
  const editor = window.activeTextEditor;
  if (!editor) {
    return; // We need something open
  }

  const fileName = editor.document.fileName;
  const astRoot = astRoots[fileName];
  if (!astRoot) return;

  if (!editor.selection) return;
  if (!lspMgr.fileInfo[fileName]) return;

  const solcRange = solcRangeFromLineColRange(editor.selection, lspMgr.fileInfo[fileName].sourceMapping.lineBreaks);
  const revealAstNode = lspMgr.solcAstNodeFromSolcRange(solcRange);
  if (revealAstNode === null) return;
  const parents: Array<number> = [];
  let n = revealAstNode;

  /* Expand parents if they are not already expanded. */
  while (!(n.id in astRoot.id2TreeItem) && n.parent) {
    parents.push(n.id);
    n = n.parent;
  }
  for (const id of parents) {
    const strId = id.toString();
    if (strId in astRoot.id2TreeItem) {
      const treeItem = astRoot.id2TreeItem[strId];
      treeItem.collabsibleState = vscode.TreeItemCollapsibleState.Expanded;
    }
  }

  const treeItem = astRoot.id2TreeItem[revealAstNode.id.toString()];
  if (treeItem) {
    treeItem.collabsibleState = vscode.TreeItemCollapsibleState.Expanded;
    astRoot.selectTreeItemToggle(treeItem);
  }
}
