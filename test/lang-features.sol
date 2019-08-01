/* A mixed bag of contracts that have various language features that we can test gathering
 */
pragma solidity >=0.5.10;
contract ArrayContract {
  uint[] data;
  function test() public {
    data.pop(); // Use of pop built-in function for `array` type
  }
}

contract Interface {
  enum MyEnum { One, Two, Three, Four } // use of enumeration
}

contract EnumContract {
  function test() pure public returns (Interface.MyEnum) {
    return Interface.MyEnum.Three;
  }
}

contract BytesContract {
    bytes data;
    function test() public {
      data.pop(); // Use of pop built-in function for `bytes` type
    }
}

contract StructContract {
    struct Snapshots {
        uint256[] ids;
        uint256[] values;
    }

    // use of Snapshots type as the target of a mapping
    mapping (address => Snapshots) private _accountBalanceSnapshots;
}
