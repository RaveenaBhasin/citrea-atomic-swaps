// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IBitcoinLightClient {
    function initializeBlockNumber(uint256) external;

    function setBlockInfo(bytes32, bytes32) external;

    function getBlockHash(uint256) external view returns (bytes32);

    function getWitnessRootByHash(bytes32) external view returns (bytes32);

    function getWitnessRootByNumber(uint256) external view returns (bytes32);

    function verifyInclusion(
        uint256 _blockNumber,
        bytes32 _wtxId,
        bytes calldata _proof,
        uint256 _index
    ) external view returns (bool);
}
