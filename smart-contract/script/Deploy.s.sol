// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {TokenTitans} from "../src/TokenTitans.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        TokenTitans tokenTitans = new TokenTitans();

        vm.stopBroadcast();

        console.log("TokenTitans deployed at:", address(tokenTitans));
    }
}
