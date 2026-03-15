// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {DelegatePolicyRegistry} from "../src/DelegatePolicyRegistry.sol";

contract DelegatePolicyRegistryTest is Test {
    DelegatePolicyRegistry public registry;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    bytes32 policyHash = keccak256("policy-1");
    bytes32 policyHash2 = keccak256("policy-2");

    function setUp() public {
        registry = new DelegatePolicyRegistry();
    }

    function test_registerPolicy_success() public {
        vm.prank(alice);
        registry.registerPolicy(policyHash, "ipfs://metadata");

        (address registrant, uint256 timestamp, string memory metadataURI) =
            registry.getPolicy(policyHash);

        assertEq(registrant, alice);
        assertEq(timestamp, block.timestamp);
        assertEq(metadataURI, "ipfs://metadata");
    }

    function test_registerPolicy_emitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit DelegatePolicyRegistry.PolicyRegistered(alice, policyHash, "ipfs://metadata", block.timestamp);
        registry.registerPolicy(policyHash, "ipfs://metadata");
    }

    function test_registerPolicy_revertZeroHash() public {
        vm.expectRevert(DelegatePolicyRegistry.ZeroPolicyHash.selector);
        registry.registerPolicy(bytes32(0), "");
    }

    function test_registerPolicy_revertDuplicate() public {
        vm.prank(alice);
        registry.registerPolicy(policyHash, "v1");

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(DelegatePolicyRegistry.PolicyAlreadyRegistered.selector, policyHash));
        registry.registerPolicy(policyHash, "v2");
    }

    function test_registerPolicy_emptyMetadata() public {
        vm.prank(alice);
        registry.registerPolicy(policyHash, "");

        (address registrant,, string memory metadataURI) = registry.getPolicy(policyHash);
        assertEq(registrant, alice);
        assertEq(metadataURI, "");
    }

    function test_registerPolicy_differentSenders() public {
        vm.prank(alice);
        registry.registerPolicy(policyHash, "alice-policy");

        vm.prank(bob);
        registry.registerPolicy(policyHash2, "bob-policy");

        (address reg1,,) = registry.getPolicy(policyHash);
        (address reg2,,) = registry.getPolicy(policyHash2);

        assertEq(reg1, alice);
        assertEq(reg2, bob);
    }

    function test_getPolicy_unregistered() public view {
        (address registrant, uint256 timestamp, string memory metadataURI) =
            registry.getPolicy(keccak256("nonexistent"));

        assertEq(registrant, address(0));
        assertEq(timestamp, 0);
        assertEq(metadataURI, "");
    }
}
