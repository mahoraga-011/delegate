// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {DelegateAgreement} from "../src/DelegateAgreement.sol";
import {DelegateAuditLog} from "../src/DelegateAuditLog.sol";

contract DelegateAgreementTest is Test {
    DelegateAuditLog public auditLog;
    DelegateAgreement public agreement;

    address partyA = makeAddr("partyA");
    address partyB = makeAddr("partyB");
    bytes32 policyHash = keccak256("policy");
    bytes32 requestHash = keccak256("request");
    bytes32 resultHash = keccak256("result");

    function setUp() public {
        auditLog = new DelegateAuditLog();
        agreement = new DelegateAgreement(address(auditLog));
    }

    function test_proposeAgreement_success() public {
        vm.prank(partyA);
        bytes32 agreementId = agreement.proposeAgreement(policyHash, partyB);

        bytes32 expectedId = keccak256(abi.encode(policyHash, partyA, partyB));
        assertEq(agreementId, expectedId);

        (bytes32 ph, address a, address b, bool sa, bool sb,) = agreement.getAgreement(agreementId);
        assertEq(ph, policyHash);
        assertEq(a, partyA);
        assertEq(b, partyB);
        assertTrue(sa);
        assertFalse(sb);
    }

    function test_proposeAgreement_emitsEvent() public {
        bytes32 expectedId = keccak256(abi.encode(policyHash, partyA, partyB));

        vm.expectEmit(true, true, true, true);
        emit DelegateAgreement.AgreementProposed(expectedId, policyHash, partyA, partyB, block.timestamp);

        vm.prank(partyA);
        agreement.proposeAgreement(policyHash, partyB);
    }

    function test_proposeAgreement_revertZeroPolicy() public {
        vm.prank(partyA);
        vm.expectRevert(DelegateAgreement.ZeroPolicyHash.selector);
        agreement.proposeAgreement(bytes32(0), partyB);
    }

    function test_proposeAgreement_revertZeroCounterparty() public {
        vm.prank(partyA);
        vm.expectRevert(DelegateAgreement.ZeroCounterparty.selector);
        agreement.proposeAgreement(policyHash, address(0));
    }

    function test_proposeAgreement_revertSelf() public {
        vm.prank(partyA);
        vm.expectRevert(DelegateAgreement.SelfAgreement.selector);
        agreement.proposeAgreement(policyHash, partyA);
    }

    function test_proposeAgreement_revertDuplicate() public {
        vm.prank(partyA);
        bytes32 agreementId = agreement.proposeAgreement(policyHash, partyB);

        vm.prank(partyA);
        vm.expectRevert(abi.encodeWithSelector(DelegateAgreement.AgreementAlreadyExists.selector, agreementId));
        agreement.proposeAgreement(policyHash, partyB);
    }

    function test_signAgreement_success() public {
        vm.prank(partyA);
        bytes32 agreementId = agreement.proposeAgreement(policyHash, partyB);

        vm.expectEmit(true, true, true, true);
        emit DelegateAgreement.AgreementFinalized(agreementId, partyA, partyB, block.timestamp);

        vm.prank(partyB);
        agreement.signAgreement(agreementId);

        (,,,, bool sb,) = agreement.getAgreement(agreementId);
        assertTrue(sb);
    }

    function test_signAgreement_revertNotFound() public {
        bytes32 fakeId = keccak256("fake");
        vm.prank(partyB);
        vm.expectRevert(abi.encodeWithSelector(DelegateAgreement.AgreementNotFound.selector, fakeId));
        agreement.signAgreement(fakeId);
    }

    function test_signAgreement_revertNotCounterparty() public {
        vm.prank(partyA);
        bytes32 agreementId = agreement.proposeAgreement(policyHash, partyB);

        address stranger = makeAddr("stranger");
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(DelegateAgreement.NotCounterparty.selector, stranger, agreementId));
        agreement.signAgreement(agreementId);
    }

    function test_signAgreement_revertAlreadySigned() public {
        vm.prank(partyA);
        bytes32 agreementId = agreement.proposeAgreement(policyHash, partyB);

        vm.prank(partyB);
        agreement.signAgreement(agreementId);

        vm.prank(partyB);
        vm.expectRevert(abi.encodeWithSelector(DelegateAgreement.AgreementAlreadySigned.selector, agreementId));
        agreement.signAgreement(agreementId);
    }

    function test_verifyCompliance_success() public {
        // Propose + sign agreement
        vm.prank(partyA);
        bytes32 agreementId = agreement.proposeAgreement(policyHash, partyB);
        vm.prank(partyB);
        agreement.signAgreement(agreementId);

        // Log decision in audit log
        vm.prank(partyA);
        auditLog.logDecision(policyHash, requestHash, resultHash, true);

        // Verify compliance
        assertTrue(agreement.verifyCompliance(agreementId, requestHash, resultHash));
    }

    function test_verifyCompliance_failsUnsigned() public {
        vm.prank(partyA);
        bytes32 agreementId = agreement.proposeAgreement(policyHash, partyB);

        // Log decision but agreement not fully signed
        vm.prank(partyA);
        auditLog.logDecision(policyHash, requestHash, resultHash, true);

        assertFalse(agreement.verifyCompliance(agreementId, requestHash, resultHash));
    }

    function test_verifyCompliance_failsNoDecision() public {
        // Propose + sign but no decision logged
        vm.prank(partyA);
        bytes32 agreementId = agreement.proposeAgreement(policyHash, partyB);
        vm.prank(partyB);
        agreement.signAgreement(agreementId);

        assertFalse(agreement.verifyCompliance(agreementId, requestHash, resultHash));
    }

    function test_verifyCompliance_failsNotFound() public {
        assertFalse(agreement.verifyCompliance(keccak256("nonexistent"), requestHash, resultHash));
    }
}
