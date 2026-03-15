// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {DelegateAuditLog} from "../src/DelegateAuditLog.sol";

contract DelegateAuditLogTest is Test {
    DelegateAuditLog public auditLog;

    address agent = makeAddr("agent");
    bytes32 policyHash = keccak256("policy");
    bytes32 requestHash = keccak256("request");
    bytes32 resultHash = keccak256("result");

    function setUp() public {
        auditLog = new DelegateAuditLog();
    }

    function _compositeKey(bytes32 p, bytes32 rq, bytes32 rs) internal pure returns (bytes32) {
        return keccak256(abi.encode(p, rq, rs));
    }

    function test_logDecision_success() public {
        vm.prank(agent);
        auditLog.logDecision(policyHash, requestHash, resultHash, true);

        bytes32 key = _compositeKey(policyHash, requestHash, resultHash);
        assertTrue(auditLog.decisions(key));
    }

    function test_logDecision_emitsEvent() public {
        vm.prank(agent);
        vm.expectEmit(true, true, false, true);
        emit DelegateAuditLog.DecisionLogged(agent, policyHash, requestHash, resultHash, true, block.timestamp);
        auditLog.logDecision(policyHash, requestHash, resultHash, true);
    }

    function test_logDecision_revertZeroPolicyHash() public {
        vm.expectRevert(DelegateAuditLog.ZeroHash.selector);
        auditLog.logDecision(bytes32(0), requestHash, resultHash, true);
    }

    function test_logDecision_revertZeroRequestHash() public {
        vm.expectRevert(DelegateAuditLog.ZeroHash.selector);
        auditLog.logDecision(policyHash, bytes32(0), resultHash, true);
    }

    function test_logDecision_revertZeroResultHash() public {
        vm.expectRevert(DelegateAuditLog.ZeroHash.selector);
        auditLog.logDecision(policyHash, requestHash, bytes32(0), true);
    }

    function test_logDecision_idempotent() public {
        vm.startPrank(agent);
        auditLog.logDecision(policyHash, requestHash, resultHash, true);
        auditLog.logDecision(policyHash, requestHash, resultHash, true);
        vm.stopPrank();

        bytes32 key = _compositeKey(policyHash, requestHash, resultHash);
        assertTrue(auditLog.decisions(key));
    }

    function test_logDecision_differentDecisions() public {
        bytes32 requestHash2 = keccak256("request-2");

        vm.startPrank(agent);
        auditLog.logDecision(policyHash, requestHash, resultHash, true);
        auditLog.logDecision(policyHash, requestHash2, resultHash, false);
        vm.stopPrank();

        bytes32 key1 = _compositeKey(policyHash, requestHash, resultHash);
        bytes32 key2 = _compositeKey(policyHash, requestHash2, resultHash);

        assertTrue(auditLog.decisions(key1));
        assertTrue(auditLog.decisions(key2));
    }

    function test_decisions_unlogged() public view {
        bytes32 key = _compositeKey(policyHash, requestHash, resultHash);
        assertFalse(auditLog.decisions(key));
    }
}
