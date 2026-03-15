// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {DelegateAuditLog} from "../src/DelegateAuditLog.sol";
import {DelegateVerifier} from "../src/DelegateVerifier.sol";
import {DelegatePolicyRegistry} from "../src/DelegatePolicyRegistry.sol";

contract DelegateVerifierTest is Test {
    DelegateAuditLog public auditLog;
    DelegateVerifier public verifier;

    address agent = makeAddr("agent");
    bytes32 policyHash = keccak256("policy");
    bytes32 requestHash = keccak256("request");
    bytes32 resultHash = keccak256("result");

    function setUp() public {
        auditLog = new DelegateAuditLog();
        verifier = new DelegateVerifier(address(auditLog));
    }

    function test_verify_returnsTrue() public {
        vm.prank(agent);
        auditLog.logDecision(policyHash, requestHash, resultHash, true);

        assertTrue(verifier.verify(policyHash, requestHash, resultHash));
    }

    function test_verify_returnsFalse() public view {
        assertFalse(verifier.verify(policyHash, requestHash, resultHash));
    }

    function test_constructor_revertZeroAddress() public {
        vm.expectRevert(DelegateVerifier.ZeroAddress.selector);
        new DelegateVerifier(address(0));
    }

    function test_verify_endToEnd() public {
        // Deploy full stack
        DelegatePolicyRegistry registry = new DelegatePolicyRegistry();

        // Register policy
        vm.prank(agent);
        registry.registerPolicy(policyHash, "ipfs://policy-doc");

        // Verify policy is registered
        (address registrant,,) = registry.getPolicy(policyHash);
        assertEq(registrant, agent);

        // Log decision
        vm.prank(agent);
        auditLog.logDecision(policyHash, requestHash, resultHash, true);

        // Verify decision
        assertTrue(verifier.verify(policyHash, requestHash, resultHash));

        // Different result is not verified
        bytes32 differentResult = keccak256("different-result");
        assertFalse(verifier.verify(policyHash, requestHash, differentResult));
    }
}
