// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {DelegateAuditLog} from "./DelegateAuditLog.sol";

/// @title DelegateAgreement
/// @notice Bilateral cooperation agreements between AI agents under shared policies.
/// @dev "Neither party can change the rules — the policy hash is immutable on-chain."
contract DelegateAgreement {
    // ──────────────────────────────────────────────
    // Storage
    // ──────────────────────────────────────────────

    struct AgreementRecord {
        bytes32 policyHash;
        address partyA;
        address partyB;
        bool signedByA;
        bool signedByB;
        uint96 timestamp;
    }

    DelegateAuditLog public immutable auditLog;

    mapping(bytes32 => AgreementRecord) private _agreements;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    event AgreementProposed(
        bytes32 indexed agreementId,
        bytes32 indexed policyHash,
        address indexed partyA,
        address partyB,
        uint256 timestamp
    );

    event AgreementFinalized(
        bytes32 indexed agreementId,
        address indexed partyA,
        address indexed partyB,
        uint256 timestamp
    );

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    error ZeroPolicyHash();
    error ZeroCounterparty();
    error SelfAgreement();
    error AgreementAlreadyExists(bytes32 agreementId);
    error AgreementNotFound(bytes32 agreementId);
    error NotCounterparty(address caller, bytes32 agreementId);
    error AgreementAlreadySigned(bytes32 agreementId);

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    constructor(address _auditLog) {
        auditLog = DelegateAuditLog(_auditLog);
    }

    // ──────────────────────────────────────────────
    // External functions
    // ──────────────────────────────────────────────

    /// @notice Propose a bilateral agreement. Caller is partyA and auto-signs.
    /// @param policyHash keccak256 of the shared policy.
    /// @param counterparty Address of partyB.
    /// @return agreementId Deterministic ID = keccak256(policyHash, partyA, partyB).
    function proposeAgreement(bytes32 policyHash, address counterparty)
        external
        returns (bytes32 agreementId)
    {
        if (policyHash == bytes32(0)) revert ZeroPolicyHash();
        if (counterparty == address(0)) revert ZeroCounterparty();
        if (counterparty == msg.sender) revert SelfAgreement();

        agreementId = keccak256(abi.encode(policyHash, msg.sender, counterparty));

        if (_agreements[agreementId].partyA != address(0)) {
            revert AgreementAlreadyExists(agreementId);
        }

        _agreements[agreementId] = AgreementRecord({
            policyHash: policyHash,
            partyA: msg.sender,
            partyB: counterparty,
            signedByA: true,
            signedByB: false,
            timestamp: uint96(block.timestamp)
        });

        emit AgreementProposed(agreementId, policyHash, msg.sender, counterparty, block.timestamp);
    }

    /// @notice Counterparty signs the agreement, finalizing it.
    /// @param agreementId The agreement to sign.
    function signAgreement(bytes32 agreementId) external {
        AgreementRecord storage a = _agreements[agreementId];
        if (a.partyA == address(0)) revert AgreementNotFound(agreementId);
        if (msg.sender != a.partyB) revert NotCounterparty(msg.sender, agreementId);
        if (a.signedByB) revert AgreementAlreadySigned(agreementId);

        a.signedByB = true;

        emit AgreementFinalized(agreementId, a.partyA, a.partyB, block.timestamp);
    }

    /// @notice Check if a decision complies with an agreement.
    /// @dev Agreement must be finalized AND the decision must exist in the AuditLog.
    /// @param agreementId The agreement to check against.
    /// @param requestHash keccak256 of the request.
    /// @param resultHash keccak256 of the result.
    /// @return compliant True if agreement is signed and decision is logged.
    function verifyCompliance(bytes32 agreementId, bytes32 requestHash, bytes32 resultHash)
        external
        view
        returns (bool compliant)
    {
        AgreementRecord storage a = _agreements[agreementId];
        if (a.partyA == address(0)) return false;
        if (!a.signedByA || !a.signedByB) return false;

        // Check decision exists in audit log
        bytes32 key = keccak256(abi.encode(a.policyHash, requestHash, resultHash));
        return auditLog.decisions(key);
    }

    /// @notice Look up an agreement.
    function getAgreement(bytes32 agreementId)
        external
        view
        returns (
            bytes32 policyHash,
            address partyA,
            address partyB,
            bool signedByA,
            bool signedByB,
            uint256 timestamp
        )
    {
        AgreementRecord storage a = _agreements[agreementId];
        return (a.policyHash, a.partyA, a.partyB, a.signedByA, a.signedByB, uint256(a.timestamp));
    }
}
