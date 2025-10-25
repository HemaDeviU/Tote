// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ToteFlow is Ownable, ReentrancyGuard {
    constructor() Ownable(msg.sender) {

    }

   
}