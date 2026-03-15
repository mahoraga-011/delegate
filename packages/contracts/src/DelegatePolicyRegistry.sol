// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title DelegatePolicyRegistry
/// @notice Tamper-proof on-chain registry for AI agent policy hashes.
/// @dev Policies are identified by their keccak256 hash (computed off-chain from
///      canonical JSON). Once registered, a policy cannot be overwritten — a
///      different policy JSON produces a different hash.
contract DelegatePolicyRegistry {
    // ──────────────────────────────────────────────
    // Storage
    // ──────────────────────────────────────────────

    struct PolicyRecord {
        address registrant; // 20 bytes ─┐
        uint96 timestamp;   // 12 bytes ─┘ packed into 1 slot
        string metadataURI; // dynamic, separate slot(s)
    }

    mapping(bytes32 => PolicyRecord) private _policies;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    event PolicyRegistered(
        address indexed registrant,
        bytes32 indexed policyHash,
        string metadataURI,
        uint256 timestamp
    );

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    error ZeroPolicyHash();
    error PolicyAlreadyRegistered(bytes32 policyHash);

    // ──────────────────────────────────────────────
    // External functions
    // ──────────────────────────────────────────────

    /// @notice Register a policy hash on-chain.
    /// @param policyHash keccak256 of the canonical policy JSON.
    /// @param metadataURI Optional URI pointing to the full policy document (IPFS, HTTP, etc.).
    function registerPolicy(bytes32 policyHash, string calldata metadataURI) external {
        if (policyHash == bytes32(0)) revert ZeroPolicyHash();
        if (_policies[policyHash].registrant != address(0)) {
            revert PolicyAlreadyRegistered(policyHash);
        }

        _policies[policyHash] = PolicyRecord({
            registrant: msg.sender,
            timestamp: uint96(block.timestamp),
            metadataURI: metadataURI
        });

        emit PolicyRegistered(msg.sender, policyHash, metadataURI, block.timestamp);
    }

    /// @notice Look up a registered policy.
    /// @return registrant  The address that registered this policy (address(0) if unregistered).
    /// @return timestamp   Block timestamp of registration (0 if unregistered).
    /// @return metadataURI The metadata URI provided at registration ("" if unregistered).
    function getPolicy(bytes32 policyHash)
        external
        view
        returns (address registrant, uint256 timestamp, string memory metadataURI)
    {
        PolicyRecord storage p = _policies[policyHash];
        return (p.registrant, uint256(p.timestamp), p.metadataURI);
    }
}
