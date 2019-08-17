<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->
**Table of Contents**

- [Prerequisites...](#prerequisites)
- [How to run code in this github repository](#how-to-run-code-in-this-github-repository)
    - [Running](#running)
    - [Debugging](#debugging)
- [See also:](#see-also)

<!-- markdown-toc end -->
Perhaps you want to help work on this awesome project? Or run it from the github repository?

# Prerequisites...

You need to have installed:

* [nodejs](https://nodejs.org/en/). Use node version 10.x. Node version 12 cannot be used. See below for details
* [npm](https://www.npmjs.com/get-npm)

And of course you need VSCode. Download it [here](https://code.visualstudio.com/download).

## node version 12 problem

Right now this code runs `solc`, and that pulls in the `scrypt` package. Nodejs version 12 doesn't work with this. See https://github.com/barrysteyn/node-scrypt/issues/193.

# Run from VSIX file...

This extension has been packaged as a [VSIX package](https://docs.microsoft.com/en-us/visualstudio/extensibility/anatomy-of-a-vsix-package?view=vs-2019). I have not been able to figure out how to use it to verify that this works. If you do, let me know.

# How to run code in this github repository

Clone the repository.


```console
$ git clone https://github.com/rocky/solc-vscode.git
Cloning into 'solc-vscode
remote: Enumerating objects: 169, done.
...
$ cd solc-vscode
$
```

Install dependent npm packages:

```console
$ make
```

For the AST view we use the [Proposed Extension API](https://code.visualstudio.com/updates/v1_29#_proposed-extension-apis) Tree2 located in `vscode.proposed.d.ts`.
I have been having problems getting this recognized by tsc. So for now I have been including the meat of this file inside `node_modules/@types/vscode/index.d.ts`

Because we use this experimental feature, you can't run `code` but must also give it the option `--enable-proposed-api rocky.vscode-solc`. The
`start.sh` POSIX shell script does this.

From inside the `solc-vscode` folder

```
$ sh ./start.sh  # or bash ./start.sh. On Unixy systems, ./start.sh will work too.
```

## Adding to your installed extensions.

I followed information from https://vscode-docs.readthedocs.io/en/stable/extensions/install-extension/. Basically after running `make`, symlink the project in your `.vscode/extensions` folker:

* Windows `%USERPROFILE%\.vscode\extensions`
* Mac `$HOME/.vscode/extensions`
* Linux `$HOME/.vscode/extensions`

So in a POSIX shell:

```
$ cd solc-vscode # root of github project
$ ln -s (cwd) -vs $HOME/.vscode/extensions
```

## Running

If you just want to run the code, on the top there is a "Debug" menu item and under that, the second item is "Start Without Debugging", which is also bound to the key sequence `Ctrl`-`F5`.

After that, the VS Code window should turn from blue to orange and another window will pop up. In this window you will have the VS Code extension installed and enabled.

When you edit a solidity file, which is either a file ending in `.sol` or a editor that has language tag "solidity", it will be colorized.

For example in this file:
```solidity
/*
 * @source: http://blockchain.unica.it/projects/ethereum-survey/attacks.html#simpledao
 * @author: Atzei N., Bartoletti M., Cimoli T
 * Modified by Josselin Feist
 */
pragma solidity 0.4.25;

contract SimpleDAO {
  mapping (address => uint) public credit;

  function donate(address to) payable public{
    credit[to] += msg.value;
  }

  function withdraw(uint amount) public{
    if (credit[msg.sender]>= amount) {
      require(msg.sender.call.value(amount)());
      credit[msg.sender]-=amount;
    }
  }

  function queryCredit(address to) view public returns(uint){
    return credit[to];
  }
}
```

the tokens "pragma", "solidity" and "0.4.25" may appear in a different color. If they all appear in the same color then the language extension mechanism is not working and there is probably something wrong in the extension. Look in the other VS Code window with the orange frame for what might be wrong.

But if everything is good, enter `Ctrl`-`Shift`-`P` and a list of commands will pop up. If you type "Solidity", you should see those specific to this extension.

## Testing

Testing seems broken. I am getting successes when there should be failures.

There are a few mocha tests of the code. At present, running tests inside VS Code is flaky when you start without debugging. I have been getting crashes. It is more reliable to run test from outside:

```shell
$ npm run test
```

This requires that you _not_ have VS Code already running. If you do want to run the tests from inside VS Code, the launch configuration "Run Solidity Extension Mocha Tests" has the right configuration.


## Debugging

You may want to extend this code, or may find a problem and want to debug. Start off from the "Debug" menu using the first item on the list "Start Debugging" which is also bound to the function key `F5`. As before the window will go orange and a popup menu bar will appear at the top.

# See also:

* [Extension API](https://code.visualstudio.com/api)
* [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)
