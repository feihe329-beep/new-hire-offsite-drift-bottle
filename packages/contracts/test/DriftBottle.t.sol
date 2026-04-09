// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {DriftBottle} from "../src/DriftBottle.sol";

contract DriftBottleTest is Test {
    DriftBottle public db;

    address owner   = makeAddr("owner");
    address alice   = makeAddr("alice");   // sender
    address bob     = makeAddr("bob");     // recipient
    address charlie = makeAddr("charlie"); // random opener

    uint256 constant LOCK = 365 days;
    uint256 constant OPEN_PRICE = 0.001 ether;

    string constant RECIPIENT_CID = "QmRecipientEncrypted";
    string constant PUBLIC_CID    = "QmPublicEncrypted";

    function setUp() public {
        db = new DriftBottle(owner);
        vm.deal(alice,   10 ether);
        vm.deal(bob,     1 ether);
        vm.deal(charlie, 1 ether);
    }

    // =========================================================
    // createCapsule
    // =========================================================

    function test_createCapsule_success() public {
        vm.prank(alice);
        uint256 id = db.createCapsule{value: 0.1 ether}(
            bob, RECIPIENT_CID, PUBLIC_CID, LOCK
        );

        assertEq(id, 0);
        assertEq(db.totalCapsules(), 1);

        (address sender, address recipient,, , uint256 eth, bool opened) = db.getCapsule(0);
        assertEq(sender, alice);
        assertEq(recipient, bob);
        assertEq(eth, 0.1 ether);
        assertFalse(opened);
    }

    function test_createCapsule_noEth() public {
        vm.prank(alice);
        db.createCapsule(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        (, , , , uint256 eth,) = db.getCapsule(0);
        assertEq(eth, 0);
    }

    function test_createCapsule_times() public {
        uint256 before = block.timestamp;
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);

        (, , uint256 unlockTime, uint256 expiryTime, ,) = db.getCapsule(0);
        assertEq(unlockTime, before + LOCK);
        assertEq(expiryTime, before + 2 * LOCK);
    }

    // =========================================================
    // getState
    // =========================================================

    function test_state_locked() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        assertEq(db.getState(0), 0); // locked
    }

    function test_state_valid() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        skip(LOCK + 1);
        assertEq(db.getState(0), 1); // valid
    }

    function test_state_expired() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        skip(2 * LOCK + 1);
        assertEq(db.getState(0), 2); // expired
    }

    function test_state_opened() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        skip(LOCK + 1);
        vm.prank(bob);
        db.open(0);
        assertEq(db.getState(0), 3); // opened
    }

    // =========================================================
    // open (recipient)
    // =========================================================

    function test_open_success() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);

        skip(LOCK + 1);

        uint256 bobBefore = bob.balance;
        vm.prank(bob);
        db.open(0);

        assertEq(bob.balance, bobBefore + 0.1 ether);
        (, , , , , bool opened) = db.getCapsule(0);
        assertTrue(opened);
    }

    function test_open_revert_stillLocked() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(DriftBottle.StillLocked.selector, 0, block.timestamp + LOCK));
        db.open(0);
    }

    function test_open_revert_notRecipient() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        skip(LOCK + 1);

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSelector(DriftBottle.NotRecipient.selector, 0));
        db.open(0);
    }

    function test_open_revert_alreadyExpired() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        skip(2 * LOCK + 1);

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(DriftBottle.AlreadyExpired.selector, 0, block.timestamp - 1));
        db.open(0);
    }

    function test_open_revert_alreadyOpened() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        skip(LOCK + 1);

        vm.prank(bob);
        db.open(0);

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(DriftBottle.AlreadyOpened.selector, 0));
        db.open(0);
    }

    // =========================================================
    // openExpired
    // =========================================================

    function test_openExpired_success() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        skip(2 * LOCK + 1);

        uint256 charlieBefore = charlie.balance;
        vm.prank(charlie);
        db.openExpired{value: OPEN_PRICE}(0);

        // charlie paid OPEN_PRICE but received 0.1 ETH from capsule
        assertEq(charlie.balance, charlieBefore - OPEN_PRICE + 0.1 ether);
        assertEq(db.protocolBalance(), OPEN_PRICE);
    }

    function test_openExpired_refundsOverpayment() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        skip(2 * LOCK + 1);

        uint256 charlieBefore = charlie.balance;
        vm.prank(charlie);
        db.openExpired{value: 0.1 ether}(0); // overpays

        // only OPEN_PRICE deducted, rest refunded
        assertEq(charlie.balance, charlieBefore - OPEN_PRICE + 0.1 ether);
    }

    function test_openExpired_revert_notExpired() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        skip(LOCK + 1); // valid window, not expired yet

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSelector(DriftBottle.NotExpiredYet.selector, 0, block.timestamp + LOCK - 1));
        db.openExpired{value: OPEN_PRICE}(0);
    }

    function test_openExpired_revert_insufficientPayment() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        skip(2 * LOCK + 1);

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSelector(DriftBottle.InsufficientPayment.selector, OPEN_PRICE, 0));
        db.openExpired{value: 0}(0);
    }

    // =========================================================
    // Demo: 1-second lock (for quick testing)
    // =========================================================

    function test_demo_shortLock() public {
        vm.prank(alice);
        uint256 id = db.createCapsule{value: 0.5 ether}(bob, RECIPIENT_CID, PUBLIC_CID, 1);

        assertEq(db.getState(id), 0); // locked

        skip(1);
        assertEq(db.getState(id), 1); // valid

        skip(1);
        assertEq(db.getState(id), 2); // expired

        uint256 charlieBefore = charlie.balance;
        vm.prank(charlie);
        db.openExpired{value: OPEN_PRICE}(id);
        assertEq(charlie.balance, charlieBefore - OPEN_PRICE + 0.5 ether);
    }

    // =========================================================
    // withdraw
    // =========================================================

    function test_withdraw_success() public {
        vm.prank(alice);
        db.createCapsule{value: 0.1 ether}(bob, RECIPIENT_CID, PUBLIC_CID, LOCK);
        skip(2 * LOCK + 1);

        vm.prank(charlie);
        db.openExpired{value: OPEN_PRICE}(0);

        uint256 ownerBefore = owner.balance;
        vm.prank(owner);
        db.withdraw();

        assertEq(owner.balance, ownerBefore + OPEN_PRICE);
        assertEq(db.protocolBalance(), 0);
    }

    function test_withdraw_revert_notOwner() public {
        vm.prank(alice);
        vm.expectRevert(DriftBottle.NotOwner.selector);
        db.withdraw();
    }

    function test_withdraw_revert_nothingToWithdraw() public {
        vm.prank(owner);
        vm.expectRevert(DriftBottle.NothingToWithdraw.selector);
        db.withdraw();
    }
}
