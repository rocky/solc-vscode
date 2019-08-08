import * as assert from 'assert';
import { before } from 'mocha';

import { solcCompileActive } from "../../commands";
import { ExtensionContext, languages, Range, SnippetString, Uri, window, workspace } from 'vscode';
import { LspManager } from "solc-lsp";

async function createTestEditor(uri: Uri, ...lines: string[]) {
	const document = await workspace.openTextDocument(uri);
	await window.showTextDocument(document);
	const activeEditor = window.activeTextEditor;
	if (!activeEditor) {
		throw new Error('no active editor');
	}

  if (lines.length > 0) {
	  await activeEditor.insertSnippet(new SnippetString(lines.join("\n")), new Range(0, 0, 1000, 0));
  }
}

suite("compile tests", () => {
  test("solcCompileActive compile", function () {
	  before(() => {
		  window.showInformationMessage('Start solcCompleActive tests.');
	  });

	  test('compile single file test', async () => {
      let filePath = __dirname + "/resources/sort.sol";
      const testDocumentUri = Uri.parse(filePath);
		  await createTestEditor(testDocumentUri);
      assert.ok(window.activeTextEditor, "we have an active text editor");
      assert.ok(solcCompileActive);
      const lspMgr = new LspManager();
      const diagCollection = languages.createDiagnosticCollection("Solidity");
      solcCompileActive(diagCollection, lspMgr, <ExtensionContext> <unknown> null, true);
    });
  });
});
