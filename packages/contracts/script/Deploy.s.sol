// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {DelegatePolicyRegistry} from "../src/DelegatePolicyRegistry.sol";
import {DelegateAuditLog} from "../src/DelegateAuditLog.sol";
import {DelegateVerifier} from "../src/DelegateVerifier.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        DelegatePolicyRegistry registry = new DelegatePolicyRegistry();
        console.log("Registry:", address(registry));

        DelegateAuditLog auditLog = new DelegateAuditLog();
        console.log("AuditLog:", address(auditLog));

        // Verifier depends on AuditLog address
        DelegateVerifier verifier = new DelegateVerifier(address(auditLog));
        console.log("Verifier:", address(verifier));

        vm.stopBroadcast();
    }
}
