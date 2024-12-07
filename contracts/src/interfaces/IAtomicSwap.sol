// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

enum Status {
    Fulfilled,
    Pending,
    Revoked
}

struct Request {
    address requestor;
    uint256 amount;
    uint256 generationTimestamp;
    Status status;
}

interface IAtomicSwap {
    function generateRequest(uint256 amount) external;

    function getRequest(
        uint256 _id
    ) external view returns (Request memory req_);

    function fullfill(uint256 _requestId) external;
}
