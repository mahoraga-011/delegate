// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {DelegateAuditLog} from "./DelegateAuditLog.sol";

/// @title DelegateVerifier
/// @notice Read-only contract that checks whether a policy decision was logged on-chain.
/// @dev Holds an immutable reference to the DelegateAuditLog. Computes the same
///      composite key and reads the public mapping via STATICCALL.
contract DelegateVerifier {
    // ──────────────────────────────────────────────
    // Storage (immutable — stored in bytecode)
    // ──────────────────────────────────────────────

    DelegateAuditLog public immutable auditLog;

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    error ZeroAddress();

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    /// @param _auditLog Address of the deployed DelegateAuditLog contract.
    constructor(address _auditLog) {
        if (_auditLog == address(0)) revert ZeroAddress();
        auditLog = DelegateAuditLog(_auditLog);
    }

    // ──────────────────────────────────────────────
    // External functions
    // ──────────────────────────────────────────────

    /// @notice Check if a specific policy decision was logged on-chain.
    /// @param policyHash  keccak256 of the canonical policy JSON.
    /// @param requestHash keccak256 of the canonical agent action request JSON.
    /// @param resultHash  keccak256 of the canonical evaluation result JSON.
    /// @return True if this exact decision exists in the audit log.
    function verify(
        bytes32 policyHash,
        bytes32 requestHash,
        bytes32 resultHash
    ) external view returns (bool) {
        bytes32 key = keccak256(abi.encode(policyHash, requestHash, resultHash));
        return auditLog.decisions(key);
    }
}
