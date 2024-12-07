// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "bitcoin-spv/solidity/contracts/ValidateSPV.sol";
import "./interfaces/IBitcoinLightClient.sol";
import {IAtomicSwap, Request, Status} from "./interfaces/IAtomicSwap.sol";

contract AtomicSwap is IAtomicSwap {
    IBitcoinLightClient public bitcoinLightClient;

    mapping(uint256 => Request) public lockedFunds;
    // id => request
    mapping(uint256 => Request) public requests;
    uint256 totalRequests;

    constructor(address _bitcoinLightClient, address _token) {
        bitcoinLightClient = IBitcoinLightClient(_bitcoinLightClient);
    }

    function generateRequest(uint256 amount) external {
        totalRequests++;
        requests[totalRequests] = Request({
            requestor: msg.sender,
            amount: amount,
            generationTimestamp: block.timestamp,
            status: Status.Pending
        });
    }

    function getRequest(
        uint256 _id
    ) external view returns (Request memory req_) {
        return requests[_id];
    }
}
