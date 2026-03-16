// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title DelegateVault
/// @notice On-chain escrow vault with policy-scoped spending limits for AI agents.
/// @dev "Agent holds no keys to the funds. Vault enforces spending limits on-chain.
///       Every payment requires policy compliance."
contract DelegateVault {
    // ──────────────────────────────────────────────
    // Storage
    // ──────────────────────────────────────────────

    struct SpendingLimit {
        address agent;
        uint256 maxPerTx;
        uint256 maxPerDay;
        address[] allowedRecipients;
    }

    struct SpendRecord {
        uint256 totalSpent;
        uint256 windowStart;
    }

    address public immutable owner;

    /// @notice ETH balance per policy hash.
    mapping(bytes32 => uint256) public balances;

    /// @notice Spending limits per policy hash.
    mapping(bytes32 => SpendingLimit) private _limits;

    /// @notice Rolling 24h spend tracking per policy hash.
    mapping(bytes32 => SpendRecord) private _spendRecords;

    /// @notice Reentrancy guard.
    bool private _locked;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    event Deposited(bytes32 indexed policyHash, address indexed depositor, uint256 amount);
    event SpendingLimitSet(bytes32 indexed policyHash, address indexed agent, uint256 maxPerTx, uint256 maxPerDay);
    event SpendExecuted(bytes32 indexed policyHash, address indexed agent, address indexed recipient, uint256 amount);
    event SpendDenied(bytes32 indexed policyHash, address indexed agent, address recipient, uint256 amount, string reason);
    event Withdrawn(bytes32 indexed policyHash, address indexed owner, uint256 amount);

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    error NotOwner();
    error NotAuthorizedAgent(bytes32 policyHash, address caller);
    error ZeroPolicyHash();
    error ZeroAmount();
    error ExceedsMaxPerTx(uint256 amount, uint256 maxPerTx);
    error ExceedsMaxPerDay(uint256 newTotal, uint256 maxPerDay);
    error RecipientNotAllowed(address recipient);
    error InsufficientBalance(uint256 available, uint256 requested);
    error TransferFailed();
    error Reentrancy();

    // ──────────────────────────────────────────────
    // Modifiers
    // ──────────────────────────────────────────────

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier nonReentrant() {
        if (_locked) revert Reentrancy();
        _locked = true;
        _;
        _locked = false;
    }

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ──────────────────────────────────────────────
    // External functions
    // ──────────────────────────────────────────────

    /// @notice Deposit ETH into the vault for a specific policy.
    /// @param policyHash keccak256 of the canonical policy JSON.
    function deposit(bytes32 policyHash) external payable {
        if (policyHash == bytes32(0)) revert ZeroPolicyHash();
        if (msg.value == 0) revert ZeroAmount();

        balances[policyHash] += msg.value;

        emit Deposited(policyHash, msg.sender, msg.value);
    }

    /// @notice Set spending limits for an agent under a policy.
    /// @param policyHash keccak256 of the canonical policy JSON.
    /// @param agent Address authorized to spend from this vault.
    /// @param maxPerTx Maximum ETH per transaction (in wei).
    /// @param maxPerDay Maximum ETH per rolling 24h window (in wei).
    /// @param allowedRecipients Addresses the agent can send to.
    function setSpendingLimit(
        bytes32 policyHash,
        address agent,
        uint256 maxPerTx,
        uint256 maxPerDay,
        address[] calldata allowedRecipients
    ) external onlyOwner {
        if (policyHash == bytes32(0)) revert ZeroPolicyHash();

        _limits[policyHash] = SpendingLimit({
            agent: agent,
            maxPerTx: maxPerTx,
            maxPerDay: maxPerDay,
            allowedRecipients: allowedRecipients
        });

        emit SpendingLimitSet(policyHash, agent, maxPerTx, maxPerDay);
    }

    /// @notice Execute a payment through the vault. Only callable by the authorized agent.
    /// @param policyHash Policy governing this spend.
    /// @param recipient Address to send ETH to.
    /// @param amount Amount of ETH to send (in wei).
    function spend(bytes32 policyHash, address payable recipient, uint256 amount)
        external
        nonReentrant
    {
        SpendingLimit storage limit = _limits[policyHash];

        // Check caller is authorized agent
        if (msg.sender != limit.agent) revert NotAuthorizedAgent(policyHash, msg.sender);

        // Check per-tx limit
        if (amount > limit.maxPerTx) {
            emit SpendDenied(policyHash, msg.sender, recipient, amount, "exceeds_max_per_tx");
            revert ExceedsMaxPerTx(amount, limit.maxPerTx);
        }

        // Check recipient allowlist
        bool recipientAllowed = false;
        for (uint256 i = 0; i < limit.allowedRecipients.length; i++) {
            if (limit.allowedRecipients[i] == recipient) {
                recipientAllowed = true;
                break;
            }
        }
        if (!recipientAllowed) {
            emit SpendDenied(policyHash, msg.sender, recipient, amount, "recipient_not_allowed");
            revert RecipientNotAllowed(recipient);
        }

        // Rolling 24h window check
        SpendRecord storage record = _spendRecords[policyHash];
        if (block.timestamp >= record.windowStart + 24 hours) {
            record.totalSpent = 0;
            record.windowStart = block.timestamp;
        }
        uint256 newTotal = record.totalSpent + amount;
        if (newTotal > limit.maxPerDay) {
            emit SpendDenied(policyHash, msg.sender, recipient, amount, "exceeds_max_per_day");
            revert ExceedsMaxPerDay(newTotal, limit.maxPerDay);
        }

        // Check vault balance
        if (amount > balances[policyHash]) {
            revert InsufficientBalance(balances[policyHash], amount);
        }

        // Effects before interactions (checks-effects-interactions)
        balances[policyHash] -= amount;
        record.totalSpent = newTotal;

        // Transfer ETH
        (bool success,) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit SpendExecuted(policyHash, msg.sender, recipient, amount);
    }

    /// @notice Withdraw remaining balance for a policy. Only callable by owner.
    /// @param policyHash Policy to withdraw funds from.
    function withdraw(bytes32 policyHash) external onlyOwner nonReentrant {
        uint256 amount = balances[policyHash];
        if (amount == 0) revert ZeroAmount();

        balances[policyHash] = 0;

        (bool success,) = payable(owner).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(policyHash, owner, amount);
    }

    /// @notice Get the vault balance for a policy.
    function getBalance(bytes32 policyHash) external view returns (uint256) {
        return balances[policyHash];
    }

    /// @notice Get the amount spent in the current 24h window for a policy.
    function getSpentToday(bytes32 policyHash) external view returns (uint256) {
        SpendRecord storage record = _spendRecords[policyHash];
        if (block.timestamp >= record.windowStart + 24 hours) {
            return 0;
        }
        return record.totalSpent;
    }

    /// @notice Get the spending limit configuration for a policy.
    function getSpendingLimit(bytes32 policyHash)
        external
        view
        returns (address agent, uint256 maxPerTx, uint256 maxPerDay, address[] memory allowedRecipients)
    {
        SpendingLimit storage limit = _limits[policyHash];
        return (limit.agent, limit.maxPerTx, limit.maxPerDay, limit.allowedRecipients);
    }

    /// @dev Allow the contract to receive ETH directly.
    receive() external payable {}
}
