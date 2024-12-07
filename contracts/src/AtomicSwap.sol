// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "bitcoin-spv/solidity/contracts/ValidateSPV.sol";
import "./IBitcoinLightClient.sol";

contract AtomicSwap {
    uint256 public number;

    function increase() public {
        number++;
    }

    function get_number() public view returns (uint256) {
        return number;
    }
}
