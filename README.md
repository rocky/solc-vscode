Solidity in VSCode using solcjs
================================

**This project is in the alpha stage of development.**

This project is VSCode Extension to support the Solidity Language. However its primary focus on showing off the features of [solcjs}(https//github.com/ethereum/solc-js) and solc's AST. We also focus on reusability of the underlying code so it might be used in other IDEs like remix and the atom editor. To this, we have created a library called [solc-lsp](https://github.com/rocky/solc-lsp).

In this project though everything is done on the client side. The _solc-lsp_ library will get reused in a Language Server using
Microsoft's [Language Server Protocol](https://github.com/Microsoft/language-server-protocol) or LSP.

If you are looking for something for ready day-to-day use, I recommend mention the [solidity plugin](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity) written by Juan Blanco.

# Installation

See [README-DEVELOP.md](https://github.com/rocky/solc-vscode/blob/master/README-DEVELOP.md) for how to install and run.

# Acknowledgements

There have been several complete rewrites of this code. Here are sources I consulted:

* Microsoft VScode extension for Typescript
* Microsoft tutorial on this and picked up the simple code LSP Example from https://github.com/microsoft/vscode-extension-samples/tree/master/lsp-sample. (But right now everything is client-side)
* the now defunct [kodebox project](https://marketplace.visualstudio.com/items?itemName=kodebox.solidity-language-server)
* Juan Blanco's plugin mentioned above.



# Contributing
Always feel free to help out! Thanks for stopping by, and possibly trying and helping out.
