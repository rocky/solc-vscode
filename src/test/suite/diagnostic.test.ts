import * as assert from 'assert';
import { before } from 'mocha';

import { solcErrToDiagnostic } from "../../diagnostics";
import { window } from 'vscode';

suite("solcErrorToDiagnostic Tests", () => {
  test("range location", function () {
    before(() => {
      window.showInformationMessage('Start diagnostic error tests.');
    });

    test('solcErrToDiagnostic test', () => {
      let expect = {
        message: "Member \"sendersfoo\" not found or not visible after argument-dependent lookup in msg.",
        range: {
          end: {
            character: 34,
            line: 5
          },
          start: {
            character: 20,
            line: 5,
          }
        },
        severity: 1
      };
      const error = {
        component: "general",
        formattedMessage: "token-good.sol:6:21: TypeError: Member \"sendersfoo\" not found or not visible after argument-dependent lookup in msg.\n    address owner = msg.sendersfoo;\n                    ^------------^\n",
        message: "Member \"sendersfoo\" not found or not visible after argument-dependent lookup in msg.",
        severity: <"error" | "warning" > "error",
        sourceLocation: {
          end: 81,
          file: "token-good.sol",
          start: 67
        },
        type: "ParserError"
      };
      assert.deepEqual(solcErrToDiagnostic(error, 1000), expect,
                       "Converts solc error to vscode diagnostic");
      const error2 = {
        component: "general",
        message: "End of tag @return not found",
        formattedMessage: "End of tag @return not found",
        severity: <"error" | "warning" > "warning",
        type: "DocstringParsingError"
      };
      const lastLine = 42;
      expect = {
        message: "End of tag @return not found",
        range: {
          end: {
            character: 0,
            line: lastLine
          },
          start: {
            character: 0,
            line: lastLine,
          }
        },
        severity: 0
      };
      assert.deepEqual(solcErrToDiagnostic(error2, lastLine), expect,
                       "Handles errors without source positions");
    });
  });
});
