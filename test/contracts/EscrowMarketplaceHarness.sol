// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {EscrowMarketplace} from "../../contracts/EscrowMarketplace.sol";

/// @dev Test-only harness exposing internal arbiter lock helpers.
/// @notice Lives under test/contracts/ so it is not part of production deployment artifacts.
contract EscrowMarketplaceHarness is EscrowMarketplace {
    constructor(
        uint256 _deliveryWindow,
        uint256 _confirmWindow,
        uint256 _arbiterStakeAmount,
        uint256 _minActiveArbiters,
        uint256 _disputeDeposit,
        uint256 _disputeDepositWindow,
        uint256 _disputeWindow,
        uint256 _sellerStakeAmount,
        uint256 _reportDeposit
    )
        EscrowMarketplace(
            _deliveryWindow,
            _confirmWindow,
            _arbiterStakeAmount,
            _minActiveArbiters,
            _disputeDeposit,
            _disputeDepositWindow,
            _disputeWindow,
            _sellerStakeAmount,
            _reportDeposit
        )
    {}

    function exposeLockArbiterForDispute(address arbiter) external {
        _lockArbiterForDispute(arbiter);
    }

    function exposeUnlockArbiterForDispute(address arbiter) external {
        _unlockArbiterForDispute(arbiter);
    }
}
