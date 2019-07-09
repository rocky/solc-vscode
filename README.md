Solidity in VSCode using solcjs
================================

**This project is in the alpha stage of development.**

This project prototypes Microsoft's [Language Server Protocol (LSP)][lsp] functions. Initiall all functions are in this extension. When this is stable,
the code will be eworked and reused as as a Solidity Language Server.

If you are looking for something for ready day-to-day use, I recommend mention the [solidity plugin](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity) written by Juan Blanco.

# Running

See `README-DEVELOP.md` for how to run.

# Acknowledgements

There have been several complete rewrites of this code. Here are sources I consulted:

* Microsoft VScode extension for Typescript
* Microsoft tutorial on this and picked up the simple code LSP Example from https://github.com/microsoft/vscode-extension-samples/tree/master/lsp-sample. (But right now everthing is client-side)
* the now defunct [kodebox project](https://marketplace.visualstudio.com/items?itemName=kodebox.solidity-language-server)
* Juan Blanco's plugin mentioned above.



# Contributing
Always feel free to help out!

[lsp]: https://github.com/Microsoft/language-server-protocol
[solc]: https://github.com/ethereum/solc-js
[vscode]: https://code.visualstudio.com/download
