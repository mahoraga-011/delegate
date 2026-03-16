// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {DelegateVault} from "../src/DelegateVault.sol";

contract DelegateVaultTest is Test {
    DelegateVault public vault;

    address vaultOwner = makeAddr("vaultOwner");
    address agent = makeAddr("agent");
    address recipient1 = makeAddr("recipient1");
    address recipient2 = makeAddr("recipient2");
    address unauthorized = makeAddr("unauthorized");

    bytes32 policyHash = keccak256("policy");

    function setUp() public {
        vm.prank(vaultOwner);
        vault = new DelegateVault();

        // Fund the vault owner
        vm.deal(vaultOwner, 100 ether);
        vm.deal(agent, 1 ether);
    }

    // ── Deposit ──

    function test_deposit_success() public {
        vm.prank(vaultOwner);
        vault.deposit{value: 1 ether}(policyHash);

        assertEq(vault.getBalance(policyHash), 1 ether);
    }

    function test_deposit_emitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit DelegateVault.Deposited(policyHash, vaultOwner, 1 ether);

        vm.prank(vaultOwner);
        vault.deposit{value: 1 ether}(policyHash);
    }

    function test_deposit_revertZeroHash() public {
        vm.prank(vaultOwner);
        vm.expectRevert(DelegateVault.ZeroPolicyHash.selector);
        vault.deposit{value: 1 ether}(bytes32(0));
    }

    function test_deposit_revertZeroAmount() public {
        vm.prank(vaultOwner);
        vm.expectRevert(DelegateVault.ZeroAmount.selector);
        vault.deposit{value: 0}(policyHash);
    }

    function test_deposit_multiple() public {
        vm.prank(vaultOwner);
        vault.deposit{value: 1 ether}(policyHash);

        vm.prank(vaultOwner);
        vault.deposit{value: 2 ether}(policyHash);

        assertEq(vault.getBalance(policyHash), 3 ether);
    }

    // ── Spending Limits ──

    function test_setSpendingLimit_success() public {
        address[] memory recipients = new address[](2);
        recipients[0] = recipient1;
        recipients[1] = recipient2;

        vm.prank(vaultOwner);
        vault.setSpendingLimit(policyHash, agent, 0.1 ether, 0.5 ether, recipients);

        (address a, uint256 maxTx, uint256 maxDay, address[] memory allowed) = vault.getSpendingLimit(policyHash);
        assertEq(a, agent);
        assertEq(maxTx, 0.1 ether);
        assertEq(maxDay, 0.5 ether);
        assertEq(allowed.length, 2);
        assertEq(allowed[0], recipient1);
    }

    function test_setSpendingLimit_revertNotOwner() public {
        address[] memory recipients = new address[](0);

        vm.prank(agent);
        vm.expectRevert(DelegateVault.NotOwner.selector);
        vault.setSpendingLimit(policyHash, agent, 0.1 ether, 0.5 ether, recipients);
    }

    // ── Spend ──

    function _setupVaultWithLimits() internal {
        address[] memory recipients = new address[](2);
        recipients[0] = recipient1;
        recipients[1] = recipient2;

        vm.prank(vaultOwner);
        vault.deposit{value: 1 ether}(policyHash);

        vm.prank(vaultOwner);
        vault.setSpendingLimit(policyHash, agent, 0.1 ether, 0.5 ether, recipients);
    }

    function test_spend_success() public {
        _setupVaultWithLimits();

        uint256 balBefore = recipient1.balance;

        vm.prank(agent);
        vault.spend(policyHash, payable(recipient1), 0.05 ether);

        assertEq(recipient1.balance - balBefore, 0.05 ether);
        assertEq(vault.getBalance(policyHash), 0.95 ether);
        assertEq(vault.getSpentToday(policyHash), 0.05 ether);
    }

    function test_spend_emitsEvent() public {
        _setupVaultWithLimits();

        vm.expectEmit(true, true, true, true);
        emit DelegateVault.SpendExecuted(policyHash, agent, recipient1, 0.05 ether);

        vm.prank(agent);
        vault.spend(policyHash, payable(recipient1), 0.05 ether);
    }

    function test_spend_revertNotAgent() public {
        _setupVaultWithLimits();

        vm.prank(unauthorized);
        vm.expectRevert(abi.encodeWithSelector(DelegateVault.NotAuthorizedAgent.selector, policyHash, unauthorized));
        vault.spend(policyHash, payable(recipient1), 0.05 ether);
    }

    function test_spend_revertExceedsMaxPerTx() public {
        _setupVaultWithLimits();

        vm.prank(agent);
        vm.expectRevert(abi.encodeWithSelector(DelegateVault.ExceedsMaxPerTx.selector, 0.2 ether, 0.1 ether));
        vault.spend(policyHash, payable(recipient1), 0.2 ether);
    }

    function test_spend_revertRecipientNotAllowed() public {
        _setupVaultWithLimits();

        address badRecipient = makeAddr("badRecipient");
        vm.prank(agent);
        vm.expectRevert(abi.encodeWithSelector(DelegateVault.RecipientNotAllowed.selector, badRecipient));
        vault.spend(policyHash, payable(badRecipient), 0.05 ether);
    }

    function test_spend_revertExceedsMaxPerDay() public {
        _setupVaultWithLimits();

        // Spend 5 times (0.1 * 5 = 0.5, which is the daily limit)
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(agent);
            vault.spend(policyHash, payable(recipient1), 0.1 ether);
        }

        // 6th should fail (would be 0.6, exceeding 0.5 daily)
        vm.prank(agent);
        vm.expectRevert(abi.encodeWithSelector(DelegateVault.ExceedsMaxPerDay.selector, 0.6 ether, 0.5 ether));
        vault.spend(policyHash, payable(recipient1), 0.1 ether);
    }

    function test_spend_dailyLimitResetsAfter24h() public {
        _setupVaultWithLimits();

        // Spend to daily limit
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(agent);
            vault.spend(policyHash, payable(recipient1), 0.1 ether);
        }

        // Warp 24h + 1s
        vm.warp(block.timestamp + 24 hours + 1);

        // Should succeed after window resets
        vm.prank(agent);
        vault.spend(policyHash, payable(recipient1), 0.1 ether);

        assertEq(vault.getSpentToday(policyHash), 0.1 ether);
    }

    function test_spend_revertInsufficientBalance() public {
        address[] memory recipients = new address[](1);
        recipients[0] = recipient1;

        // Deposit only 0.05 ETH
        vm.prank(vaultOwner);
        vault.deposit{value: 0.05 ether}(policyHash);

        vm.prank(vaultOwner);
        vault.setSpendingLimit(policyHash, agent, 0.1 ether, 0.5 ether, recipients);

        vm.prank(agent);
        vm.expectRevert(abi.encodeWithSelector(DelegateVault.InsufficientBalance.selector, 0.05 ether, 0.1 ether));
        vault.spend(policyHash, payable(recipient1), 0.1 ether);
    }

    // ── Withdraw ──

    function test_withdraw_success() public {
        vm.prank(vaultOwner);
        vault.deposit{value: 1 ether}(policyHash);

        uint256 balBefore = vaultOwner.balance;

        vm.prank(vaultOwner);
        vault.withdraw(policyHash);

        assertEq(vaultOwner.balance - balBefore, 1 ether);
        assertEq(vault.getBalance(policyHash), 0);
    }

    function test_withdraw_emitsEvent() public {
        vm.prank(vaultOwner);
        vault.deposit{value: 1 ether}(policyHash);

        vm.expectEmit(true, true, false, true);
        emit DelegateVault.Withdrawn(policyHash, vaultOwner, 1 ether);

        vm.prank(vaultOwner);
        vault.withdraw(policyHash);
    }

    function test_withdraw_revertNotOwner() public {
        vm.prank(vaultOwner);
        vault.deposit{value: 1 ether}(policyHash);

        vm.prank(agent);
        vm.expectRevert(DelegateVault.NotOwner.selector);
        vault.withdraw(policyHash);
    }

    function test_withdraw_revertZeroBalance() public {
        vm.prank(vaultOwner);
        vm.expectRevert(DelegateVault.ZeroAmount.selector);
        vault.withdraw(policyHash);
    }

    // ── View helpers ──

    function test_getSpentToday_zeroAfterWindow() public {
        _setupVaultWithLimits();

        vm.prank(agent);
        vault.spend(policyHash, payable(recipient1), 0.05 ether);

        assertEq(vault.getSpentToday(policyHash), 0.05 ether);

        vm.warp(block.timestamp + 24 hours + 1);
        assertEq(vault.getSpentToday(policyHash), 0);
    }
}
