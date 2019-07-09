const assert = require("assert");
debugger
const d = require("../src/compiler/diagnostics");
describe("solcErrorToDiagnostic)", () => {
    it("should parse a range location", () => {
	    const expect = {
            "message":
	        "Member \"sendersfoo\" not found or not visible after argument-dependent lookup in msg.",
            "range": {
		        "end": {
                    "character": 34,
                    "line": 5
		        },
		        "start": {
                    "character": 20,
                    "line": 5,
		        }
	        },
	        "severity": 1
        };

        const error = {
            component: "general",
            formattedMessage: "/src/external-vcs/github/rocky/solidity-language-server/tmp/token-good.sol:6:21: TypeError: Member \"sendersfoo\" not found or not visible after argument-dependent lookup in msg.\n    address owner = msg.sendersfoo;\n                    ^------------^\n",
            message: "Member \"sendersfoo\" not found or not visible after argument-dependent lookup in msg.",
            severity: 1,
            sourceLocation: {
                end: 81,
                file: "/src/external-vcs/github/rocky/solidity-language-server/tmp/token-good.sol",
                start: 67
            }
        };
        const loc = d.solcErrToDiagnostic(error);
        assert.deepEqual(loc, expect);
    });
});
//# sourceMappingURL=simple.spec.js.map
