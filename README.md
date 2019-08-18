Solidity VS Code Extension base on solc-lsp
=====================================================

![extension demo](https://github.com/rocky/solc-vscode/blob/master/screenshots/vscode-demo.gif "Hover and LSP functions")

**This project is in the alpha stage of development.**

This project is VS Code Extension to support the Solidity language. Its primary focus is showing off the features of [solcjs}(https//github.com/ethereum/solc-js) and solc's AST. We also focus on reusability of the underlying code so it might be used in other IDEs like remix and the atom editor. To do this, we have created a library called [solc-lsp](https://github.com/rocky/solc-lsp).

In this project, everything is done on the client side. The _solc-lsp_ library will get reused in a language server using
Microsoft's [Language Server Protocol](https://github.com/Microsoft/language-server-protocol) or LSP.

If you are looking for something ready for day-to-day use, I recommend the [solidity plugin](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity) written by Juan Blanco.

# Videos

I have 3 short demos of this code on youtube:

* Part 1 [Find References, Peek/Goto Definition, and AST Nodes
](https://www.youtube.com/watch?v=jV1DLPnUPUU)
* Part 2 [Error recovery and Solidity AST TreeView](https://www.youtube.com/watch?v=jV1DLPnUPUU)
* Part 3 [Completion and Doc Comments](https://www.youtube.com/watch?v=SaaAYaEvrXE)

# Installation

See [README-DEVELOP.md](https://github.com/rocky/solc-vscode/blob/master/README-DEVELOP.md) for how to install and run.

# Acknowledgements

There have been several complete rewrites of this code. Here are the sources I consulted:

* Microsoft VS Code extension for Typescript
* Microsoft tutorial on writing a VS Code extension. The simple code for the LSP example is from https://github.com/microsoft/vscode-extension-samples/tree/master/lsp-sample. (But right now everything is client-side.)
* The now defunct [kodebox project](https://marketplace.visualstudio.com/items?itemName=kodebox.solidity-language-server)
* Juan Blanco's plugin mentioned above.


# Contributing
Always feel free to help out! Thanks for stopping by, and possibly trying and helping.

# Thanks

A big thanks to my employer, ConsenSys, for giving me the opportunity to work on this and providing the funding for this project.
