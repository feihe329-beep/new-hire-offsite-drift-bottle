// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @title DriftBottle — Onchain Time Capsule
/// @notice Send a message + ETH to someone, locked until a future date.
///         If unclaimed past the expiry window, anyone can pay to open it.
contract DriftBottle {
    // =========================================================
    // Constants
    // =========================================================

    /// @notice Fixed price (in wei) to open an expired capsule.
    uint256 public constant OPEN_PRICE = 0.001 ether;

    // =========================================================
    // Types
    // =========================================================

    struct Capsule {
        address sender;
        address recipient;
        /// @dev IPFS CID of the message encrypted with recipient's public key.
        string recipientCID;
        /// @dev IPFS CID of the message encrypted with the contract owner's public key.
        ///      Released to the opener after expiry.
        string publicCID;
        /// @dev Timestamp after which the recipient may open the capsule.
        uint256 unlockTime;
        /// @dev Timestamp after which anyone may open the capsule (= unlockTime + lockDuration).
        uint256 expiryTime;
        /// @dev ETH locked inside.
        uint256 ethAmount;
        bool opened;
    }

    // =========================================================
    // Storage
    // =========================================================

    address public owner;
    Capsule[] private _capsules;
    uint256 public protocolBalance;

    // =========================================================
    // Events
    // =========================================================

    event CapsuleCreated(
        uint256 indexed capsuleId,
        address indexed sender,
        address indexed recipient,
        uint256 unlockTime,
        uint256 expiryTime,
        uint256 ethAmount
    );

    event CapsuleOpened(uint256 indexed capsuleId, address opener);
    event ExpiredCapsuleOpened(uint256 indexed capsuleId, address opener);
    event Withdrawn(address indexed owner, uint256 amount);

    // =========================================================
    // Errors
    // =========================================================

    error NotOwner();
    error AlreadyOpened(uint256 capsuleId);
    error NotRecipient(uint256 capsuleId);
    error StillLocked(uint256 capsuleId, uint256 unlockTime);
    error AlreadyExpired(uint256 capsuleId, uint256 expiryTime);
    error NotExpiredYet(uint256 capsuleId, uint256 expiryTime);
    error InsufficientPayment(uint256 required, uint256 provided);
    error TransferFailed();
    error NothingToWithdraw();

    // =========================================================
    // Modifiers
    // =========================================================

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // =========================================================
    // Constructor
    // =========================================================

    constructor(address owner_) {
        owner = owner_;
    }

    // =========================================================
    // Write Functions
    // =========================================================

    /// @notice Create a new time capsule.
    /// @param recipient   Address of the intended recipient.
    /// @param recipientCID IPFS CID of message encrypted with recipient's public key.
    /// @param publicCID   IPFS CID of message encrypted with owner's public key (for expiry).
    /// @param lockDuration Seconds until the recipient can open the capsule.
    ///                    The expiry window is an equal duration after that.
    /// @return capsuleId  ID of the newly created capsule.
    function createCapsule(
        address recipient,
        string calldata recipientCID,
        string calldata publicCID,
        uint256 lockDuration
    ) external payable returns (uint256 capsuleId) {
        capsuleId = _capsules.length;
        uint256 unlockTime = block.timestamp + lockDuration;
        uint256 expiryTime = unlockTime + lockDuration; // valid window == lock duration

        _capsules.push(Capsule({
            sender: msg.sender,
            recipient: recipient,
            recipientCID: recipientCID,
            publicCID: publicCID,
            unlockTime: unlockTime,
            expiryTime: expiryTime,
            ethAmount: msg.value,
            opened: false
        }));

        emit CapsuleCreated(capsuleId, msg.sender, recipient, unlockTime, expiryTime, msg.value);
    }

    /// @notice Recipient opens their capsule during the valid window.
    ///         Transfers locked ETH to the recipient and returns the decrypted CID.
    /// @param capsuleId ID of the capsule to open.
    /// @return recipientCID IPFS CID of the recipient-encrypted message.
    function open(uint256 capsuleId) external returns (string memory recipientCID) {
        Capsule storage c = _capsules[capsuleId];

        // CHECKS
        if (c.opened) revert AlreadyOpened(capsuleId);
        if (msg.sender != c.recipient) revert NotRecipient(capsuleId);
        if (block.timestamp < c.unlockTime) revert StillLocked(capsuleId, c.unlockTime);
        if (block.timestamp >= c.expiryTime) revert AlreadyExpired(capsuleId, c.expiryTime);

        // EFFECTS
        c.opened = true;
        uint256 amount = c.ethAmount;

        // INTERACTIONS
        if (amount > 0) {
            (bool success,) = payable(msg.sender).call{value: amount}("");
            if (!success) revert TransferFailed();
        }

        emit CapsuleOpened(capsuleId, msg.sender);
        return c.recipientCID;
    }

    /// @notice Anyone can open an expired capsule by paying OPEN_PRICE.
    ///         Transfers locked ETH to the opener and returns the public CID.
    /// @param capsuleId ID of the expired capsule to open.
    /// @return publicCID IPFS CID of the publicly-encrypted message.
    function openExpired(uint256 capsuleId) external payable returns (string memory publicCID) {
        Capsule storage c = _capsules[capsuleId];

        // CHECKS
        if (c.opened) revert AlreadyOpened(capsuleId);
        if (block.timestamp < c.expiryTime) revert NotExpiredYet(capsuleId, c.expiryTime);
        if (msg.value < OPEN_PRICE) revert InsufficientPayment(OPEN_PRICE, msg.value);

        // EFFECTS
        c.opened = true;
        protocolBalance += OPEN_PRICE;
        uint256 capsuleEth = c.ethAmount;
        uint256 refund = msg.value - OPEN_PRICE;

        // INTERACTIONS
        if (capsuleEth > 0) {
            (bool success,) = payable(msg.sender).call{value: capsuleEth}("");
            if (!success) revert TransferFailed();
        }
        if (refund > 0) {
            (bool success,) = payable(msg.sender).call{value: refund}("");
            if (!success) revert TransferFailed();
        }

        emit ExpiredCapsuleOpened(capsuleId, msg.sender);
        return c.publicCID;
    }

    /// @notice Owner withdraws accumulated protocol fees.
    function withdraw() external onlyOwner {
        uint256 amount = protocolBalance;
        if (amount == 0) revert NothingToWithdraw();

        protocolBalance = 0;
        (bool success,) = payable(owner).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(owner, amount);
    }

    // =========================================================
    // Read Functions
    // =========================================================

    function totalCapsules() external view returns (uint256) {
        return _capsules.length;
    }

    /// @notice Returns metadata for a capsule (no encrypted content).
    function getCapsule(uint256 capsuleId)
        external
        view
        returns (
            address sender,
            address recipient,
            uint256 unlockTime,
            uint256 expiryTime,
            uint256 ethAmount,
            bool opened
        )
    {
        Capsule storage c = _capsules[capsuleId];
        return (c.sender, c.recipient, c.unlockTime, c.expiryTime, c.ethAmount, c.opened);
    }

    /// @notice Returns the recipient-encrypted CID. Only callable by the recipient
    ///         during the valid window. Use open() to also claim ETH.
    function getRecipientCID(uint256 capsuleId) external view returns (string memory) {
        Capsule storage c = _capsules[capsuleId];
        if (msg.sender != c.recipient) revert NotRecipient(capsuleId);
        if (block.timestamp < c.unlockTime) revert StillLocked(capsuleId, c.unlockTime);
        return c.recipientCID;
    }

    /// @notice Returns the publicly-encrypted CID after a capsule has been opened via openExpired().
    function getPublicCID(uint256 capsuleId) external view returns (string memory) {
        Capsule storage c = _capsules[capsuleId];
        if (!c.opened || block.timestamp < c.expiryTime) revert NotExpiredYet(capsuleId, c.expiryTime);
        return c.publicCID;
    }

    /// @notice Returns the current state of a capsule.
    /// @return 0 = locked, 1 = valid (recipient can open), 2 = expired, 3 = opened
    function getState(uint256 capsuleId) external view returns (uint8) {
        Capsule storage c = _capsules[capsuleId];
        if (c.opened) return 3;
        if (block.timestamp < c.unlockTime) return 0;
        if (block.timestamp < c.expiryTime) return 1;
        return 2;
    }
}
