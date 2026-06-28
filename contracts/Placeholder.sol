// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @dev 占位合约，仅用于验证 Hardhat 工程骨架可编译；业务合约在后续 change 中实现。
contract Placeholder {
    uint256 public value;

    function setValue(uint256 newValue) external {
        value = newValue;
    }
}
