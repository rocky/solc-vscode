<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->
**Table of Contents**

- [Prerequisites...](#prerequisites)
- [How to run code in this github repository](#how-to-run-code-in-this-github-repository)
    - [Running](#running)
    - [Debugging](#debugging)
- [See also:](#see-also)

<!-- markdown-toc end -->
Perhaps you want to help work on this awesome project? Or run from the github repository?

# Prerequisites...

You need to have installed

* [nodejs](https://nodejs.org/en/). Currently node version 12 cannot be used to build a dependent package `scrypt`, so use an earlier version. See below for details
* [npm](https://www.npmjs.com/get-npm)

There are a number of nodejs packages are needed, like [typescript](https://www.typescriptlang.org/), but you can get those via `npm`,
which is described in a below [section](#how-to-run-code-in-this-github-repository).

And of course you need VSCode. Download it [here](https://code.visualstudio.com/download).

## node version 12 problem

Right now this code runs `solc`, and untimately that pulls in the `scrypt` package. Nodejs version 12 doesn't work with this. See https://github.com/barrysteyn/node-scrypt/issues/193.

# How to run code in this github repository

Clone the repository.
You'll need to also clone `solc-lsp` at the same drectory level as solc-vscode:

```console
$ git clone https://github.com/rocky/solc-lsp.git
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

## Running

If you just want to run the code, on the top there is a "Debug" menu item and under that, the second item is "Start Without Debugging", which is also bound the key sequence `Ctrl`-`F5`.

After that, the VSCode window should turn from blue to orange and another window will pop up. In this window you will have the vscode extension installed and enabled.

If you edit a solidity file, which is a file ending in `.sol` and looks like this:

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

This when rendered inside be colorized, for example the tokens "pragma", "solidity" and "0.4.25" may appear in a different color. If the all appear in the same color then the language extension mechanism is not working and there is probably something wrong in the extension. Look in the other VSCode window with the orange frame for what might be wrong.

But if everything is good, enter `Ctrl`-`Shift`-`P` and a list of commands will pop up. If you type "Solidity", you should see those specific to this extension.

## Testing

Testing seems broken. I am getting successes when there should be failures.

There are a few mocha tests of the code. At present, it feels running tests inside vscode is flaky when you start without debugging. I have been getting crashes. The most reliable has been to run test from outside:

```shell
$ npm run test
```

This requires though that you _not_ have vscode already running. If you do want to run the tests from inside vscode, the launch configuration "Run Solidity Extension Mocha Tests" has the right configuration for doing this.


## Debugging

You may want to extend this code of may find a problem and want to debug what is going wrong. For this, you start off from the "Debug" menu using the first item on the list "Start Debugging" which is also bound to the function key `F5`. As before the window will go orange a popup menu bar will appear at the top.

# See also:

* [Extension API](https://code.visualstudio.com/api)
* [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)
