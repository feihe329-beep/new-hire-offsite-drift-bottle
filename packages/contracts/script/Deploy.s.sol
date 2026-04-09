// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {DriftBottle} from "../src/DriftBottle.sol";

contract Deploy is Script {
    function run() external {
        address deployer = msg.sender;
        vm.startBroadcast(deployer);

        DriftBottle db = new DriftBottle(deployer);
        console.log("DriftBottle deployed to:", address(db));
        console.log("Owner:", deployer);
        console.log("Open price:", db.OPEN_PRICE());

        vm.stopBroadcast();
    }
}
