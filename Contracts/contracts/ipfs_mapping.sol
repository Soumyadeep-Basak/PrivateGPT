// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserIPFSMap {
    // Mapping of user address to a list of IPFS CIDs
    mapping(address => string[]) private userCIDs;

    // Event to log new CID storage
    event CIDStored(address indexed user, string cid);

    // Function to store a new CID for the sender's address
    function storeCID(string memory cid) external {
        userCIDs[msg.sender].push(cid);
        emit CIDStored(msg.sender, cid);
    }

    // Function to retrieve all CIDs associated with the sender's address
    function getCIDs() external view returns (string[] memory) {
        return userCIDs[msg.sender];
    }
}
