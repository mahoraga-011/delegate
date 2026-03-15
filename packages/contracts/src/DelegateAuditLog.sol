// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title DelegateAuditLog
/// @notice Append-only on-chain log of AI agent policy decisions.
/// @dev Each decision is stored as a composite key derived from the policy,
///      request, and result hashes. The mapping is public so the Verifier
///      contract can read it directly via the auto-generated getter.
contract DelegateAuditLog {
    // ──────────────────────────────────────────────
    // Storage
    // ──────────────────────────────────────────────

    /// @notice Mapping from composite decision key to existence flag.
    /// @dev Key = keccak256(abi.encode(policyHash, requestHash, resultHash)).
    ///      Public so DelegateVerifier can call decisions(key) via STATICCALL.
    mapping(bytes32 => bool) public decisions;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    event DecisionLogged(
        address indexed agent,
        bytes32 indexed policyHash,
        bytes32 requestHash,
        bytes32 resultHash,
        bool allowed,
        uint256 timestamp
    );

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    error ZeroHash();

    // ──────────────────────────────────────────────
    // External functions
    // ──────────────────────────────────────────────

    /// @notice Log a policy decision on-chain.
    /// @param policyHash  keccak256 of the canonical policy JSON.
    /// @param requestHash keccak256 of the canonical agent action request JSON.
    /// @param resultHash  keccak256 of the canonical evaluation result JSON.
    /// @param allowed     Whether the policy allowed the action.
    function logDecision(
        bytes32 policyHash,
        bytes32 requestHash,
        bytes32 resultHash,
        bool allowed
    ) external {
        if (policyHash == bytes32(0) || requestHash == bytes32(0) || resultHash == bytes32(0)) {
            revert ZeroHash();
        }

        bytes32 key = keccak256(abi.encode(policyHash, requestHash, resultHash));
        decisions[key] = true;

        emit DecisionLogged(msg.sender, policyHash, requestHash, resultHash, allowed, block.timestamp);
    }
}
