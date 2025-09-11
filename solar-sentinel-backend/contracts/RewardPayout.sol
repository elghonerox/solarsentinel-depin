pragma solidity ^0.8.0;

/**
 * @title RewardPayout
 * @dev Smart contract for automating EnergyToken (ETK) payouts in SolarSentinel DePIN.
 *      Integrates with Hedera Token Service (HTS) for token transfers (simulated for MVP).
 *      Designed for Hedera Africa Hackathon 2025 to incentivize solar panel maintenance.
 */
contract RewardPayout {
    address public owner;

    /**
     * @dev Sets the contract deployer as the owner.
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Emits a payout event for token rewards (HTS transfer in production).
     * @param to Address to receive tokens (maintainer’s wallet).
     * @param amount Amount of ETK tokens to transfer (in tiniest units, e.g., 100 = 1.00 ETK).
     */
    function payout(address to, uint amount) public {
        require(msg.sender == owner, "Only owner can payout");
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");

        // In production, use HTS precompiles to transfer EnergyTokens (ETK).
        // For MVP, emit an event to simulate payout for hackathon demo.
        emit PayoutInitiated(to, amount);
    }

    /**
     * @dev Event emitted when a payout is initiated.
     * @param to Address receiving the tokens.
     * @param amount Amount of tokens.
     */
    event PayoutInitiated(address indexed to, uint amount);
}