// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {DelegatePolicyRegistry} from "./DelegatePolicyRegistry.sol";

/// @title DelegateAgentRegistry
/// @notice On-chain identity registry for AI agents.
/// @dev Agents register with an ID and metadata URI, then commit to policies.
///      "I trust you because I verified your on-chain commitments, not because a registry vouched for you."
contract DelegateAgentRegistry {
    // ──────────────────────────────────────────────
    // Storage
    // ──────────────────────────────────────────────

    struct AgentRecord {
        bytes32 agentId;
        string metadataURI;
        bytes32[] policyHashes;
    }

    DelegatePolicyRegistry public immutable policyRegistry;

    mapping(address => AgentRecord) private _agents;
    mapping(address => bool) public isRegistered;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    event AgentRegistered(
        address indexed owner,
        bytes32 indexed agentId,
        string metadataURI,
        uint256 timestamp
    );

    event PolicyCommitted(
        address indexed owner,
        bytes32 indexed policyHash,
        uint256 timestamp
    );

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    error ZeroAgentId();
    error AgentAlreadyRegistered(address owner);
    error AgentNotRegistered(address owner);
    error PolicyNotRegistered(bytes32 policyHash);

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    constructor(address _policyRegistry) {
        policyRegistry = DelegatePolicyRegistry(_policyRegistry);
    }

    // ──────────────────────────────────────────────
    // External functions
    // ──────────────────────────────────────────────

    /// @notice Register an agent identity on-chain.
    /// @param agentId Unique identifier for the agent.
    /// @param metadataURI URI pointing to agent metadata (IPFS, HTTP, etc.).
    function registerAgent(bytes32 agentId, string calldata metadataURI) external {
        if (agentId == bytes32(0)) revert ZeroAgentId();
        if (isRegistered[msg.sender]) revert AgentAlreadyRegistered(msg.sender);

        _agents[msg.sender] = AgentRecord({
            agentId: agentId,
            metadataURI: metadataURI,
            policyHashes: new bytes32[](0)
        });
        isRegistered[msg.sender] = true;

        emit AgentRegistered(msg.sender, agentId, metadataURI, block.timestamp);
    }

    /// @notice Commit to a policy. Policy must exist in the PolicyRegistry.
    /// @param policyHash keccak256 of the canonical policy JSON.
    function commitPolicy(bytes32 policyHash) external {
        if (!isRegistered[msg.sender]) revert AgentNotRegistered(msg.sender);

        // Verify policy exists in the registry
        (address registrant,,) = policyRegistry.getPolicy(policyHash);
        if (registrant == address(0)) revert PolicyNotRegistered(policyHash);

        _agents[msg.sender].policyHashes.push(policyHash);

        emit PolicyCommitted(msg.sender, policyHash, block.timestamp);
    }

    /// @notice Look up an agent by address.
    /// @return agentId The agent's unique identifier.
    /// @return metadataURI The agent's metadata URI.
    /// @return policyHashes Array of committed policy hashes.
    function getAgent(address owner)
        external
        view
        returns (bytes32 agentId, string memory metadataURI, bytes32[] memory policyHashes)
    {
        AgentRecord storage a = _agents[owner];
        return (a.agentId, a.metadataURI, a.policyHashes);
    }
}
