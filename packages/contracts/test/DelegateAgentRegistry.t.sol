// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {DelegateAgentRegistry} from "../src/DelegateAgentRegistry.sol";
import {DelegatePolicyRegistry} from "../src/DelegatePolicyRegistry.sol";

contract DelegateAgentRegistryTest is Test {
    DelegatePolicyRegistry public policyRegistry;
    DelegateAgentRegistry public agentRegistry;

    address agent = makeAddr("agent");
    address agent2 = makeAddr("agent2");
    bytes32 agentId = keccak256("agent-alpha");
    bytes32 policyHash = keccak256("policy");

    function setUp() public {
        policyRegistry = new DelegatePolicyRegistry();
        agentRegistry = new DelegateAgentRegistry(address(policyRegistry));

        // Pre-register a policy
        policyRegistry.registerPolicy(policyHash, "ipfs://policy");
    }

    function test_registerAgent_success() public {
        vm.prank(agent);
        agentRegistry.registerAgent(agentId, "ipfs://agent-meta");

        (bytes32 id, string memory uri, bytes32[] memory policies) = agentRegistry.getAgent(agent);
        assertEq(id, agentId);
        assertEq(uri, "ipfs://agent-meta");
        assertEq(policies.length, 0);
        assertTrue(agentRegistry.isRegistered(agent));
    }

    function test_registerAgent_emitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit DelegateAgentRegistry.AgentRegistered(agent, agentId, "ipfs://agent-meta", block.timestamp);

        vm.prank(agent);
        agentRegistry.registerAgent(agentId, "ipfs://agent-meta");
    }

    function test_registerAgent_revertZeroId() public {
        vm.prank(agent);
        vm.expectRevert(DelegateAgentRegistry.ZeroAgentId.selector);
        agentRegistry.registerAgent(bytes32(0), "ipfs://meta");
    }

    function test_registerAgent_revertDuplicate() public {
        vm.prank(agent);
        agentRegistry.registerAgent(agentId, "ipfs://meta");

        vm.prank(agent);
        vm.expectRevert(abi.encodeWithSelector(DelegateAgentRegistry.AgentAlreadyRegistered.selector, agent));
        agentRegistry.registerAgent(keccak256("other"), "ipfs://meta2");
    }

    function test_commitPolicy_success() public {
        vm.prank(agent);
        agentRegistry.registerAgent(agentId, "ipfs://meta");

        vm.prank(agent);
        agentRegistry.commitPolicy(policyHash);

        (, , bytes32[] memory policies) = agentRegistry.getAgent(agent);
        assertEq(policies.length, 1);
        assertEq(policies[0], policyHash);
    }

    function test_commitPolicy_emitsEvent() public {
        vm.prank(agent);
        agentRegistry.registerAgent(agentId, "ipfs://meta");

        vm.expectEmit(true, true, false, true);
        emit DelegateAgentRegistry.PolicyCommitted(agent, policyHash, block.timestamp);

        vm.prank(agent);
        agentRegistry.commitPolicy(policyHash);
    }

    function test_commitPolicy_revertNotRegistered() public {
        vm.prank(agent);
        vm.expectRevert(abi.encodeWithSelector(DelegateAgentRegistry.AgentNotRegistered.selector, agent));
        agentRegistry.commitPolicy(policyHash);
    }

    function test_commitPolicy_revertPolicyNotRegistered() public {
        vm.prank(agent);
        agentRegistry.registerAgent(agentId, "ipfs://meta");

        bytes32 unknownPolicy = keccak256("unknown");
        vm.prank(agent);
        vm.expectRevert(abi.encodeWithSelector(DelegateAgentRegistry.PolicyNotRegistered.selector, unknownPolicy));
        agentRegistry.commitPolicy(unknownPolicy);
    }

    function test_getAgent_unregistered() public view {
        (bytes32 id, string memory uri, bytes32[] memory policies) = agentRegistry.getAgent(agent);
        assertEq(id, bytes32(0));
        assertEq(bytes(uri).length, 0);
        assertEq(policies.length, 0);
    }

    function test_multipleAgents() public {
        vm.prank(agent);
        agentRegistry.registerAgent(agentId, "ipfs://meta1");

        bytes32 agentId2 = keccak256("agent-beta");
        vm.prank(agent2);
        agentRegistry.registerAgent(agentId2, "ipfs://meta2");

        (bytes32 id1,,) = agentRegistry.getAgent(agent);
        (bytes32 id2,,) = agentRegistry.getAgent(agent2);
        assertEq(id1, agentId);
        assertEq(id2, agentId2);
    }
}
