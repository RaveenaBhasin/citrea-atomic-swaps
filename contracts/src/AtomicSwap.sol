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

    event GenerateRequest(uint256 amount, string receiver);
    event RequestFulfilled(bool isIncluded);
    event ReleaseFunds(uint256 requestId, address user);
    event RequestRevoked(uint256 requestId);

    constructor(address _bitcoinLightClient) {
        bitcoinLightClient = IBitcoinLightClient(_bitcoinLightClient);
    }

    function generateRequest(
        uint256 amount,
        string memory reciever
    ) external payable {
        require(msg.value == amount, "Not enough funds sent");
        totalRequests++;
        requests[totalRequests] = Request({
            requestor: msg.sender,
            reciever: reciever,
            amount: amount,
            generationTimestamp: block.timestamp,
            status: Status.Pending
        });
        emit GenerateRequest(amount, reciever);
    }

    function getRequest(uint256 _id) public view returns (Request memory req_) {
        return requests[_id];
    }

    function fullfill(
        uint256 _requestId,
        uint256 _blockNumber,
        bytes32 _wtxId,
        bytes calldata _proof,
        uint256 _index
    ) external {
        bool is_included = bitcoinLightClient.verifyInclusion(
            _blockNumber,
            _wtxId,
            _proof,
            _index
        );

        require(is_included, "Transaction not included");
        emit RequestFulfilled(is_included);
        releaseFundsTo(_requestId, msg.sender);
    }

    function releaseFundsTo(uint256 _requestId, address user) private {
        Request memory request = getRequest(_requestId);

        // Update status of the request
        request.status = Status.Fulfilled;
        requests[_requestId] = request;

        uint256 amount = request.amount;
        (bool success, bytes memory _data) = user.call{value: amount}("");
        require(success, "Failed to send funds");
        emit ReleaseFunds(_requestId, user);
    }

    function revokeRequest(uint256 _requestId) external {
        Request memory request = getRequest(_requestId);
        require(request.requestor == msg.sender, "Un athorised caller");

        // Update status to Revoked
        request.status = Status.Revoked;
        requests[_requestId] = request;

        (bool success, bytes memory _data) = request.requestor.call{
            value: request.amount
        }("");
        require(success, "Failed to send funds");
        emit RequestRevoked(_requestId);
    }
}
