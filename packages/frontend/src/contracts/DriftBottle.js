import { baseSepolia } from 'viem/chains';
export const DRIFT_BOTTLE_ADDRESS = '0x0000000000000000000000000000000000000000';
export const DRIFT_BOTTLE_ABI = [
    {
        type: 'constructor',
        inputs: [{ name: 'owner_', type: 'address', internalType: 'address' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'OPEN_PRICE',
        inputs: [],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'createCapsule',
        inputs: [
            { name: 'recipient', type: 'address', internalType: 'address' },
            { name: 'recipientCID', type: 'string', internalType: 'string' },
            { name: 'publicCID', type: 'string', internalType: 'string' },
            { name: 'lockDuration', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'capsuleId', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'getCapsule',
        inputs: [{ name: 'capsuleId', type: 'uint256', internalType: 'uint256' }],
        outputs: [
            { name: 'sender', type: 'address', internalType: 'address' },
            { name: 'recipient', type: 'address', internalType: 'address' },
            { name: 'unlockTime', type: 'uint256', internalType: 'uint256' },
            { name: 'expiryTime', type: 'uint256', internalType: 'uint256' },
            { name: 'ethAmount', type: 'uint256', internalType: 'uint256' },
            { name: 'opened', type: 'bool', internalType: 'bool' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getPublicCID',
        inputs: [{ name: 'capsuleId', type: 'uint256', internalType: 'uint256' }],
        outputs: [{ name: '', type: 'string', internalType: 'string' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getRecipientCID',
        inputs: [{ name: 'capsuleId', type: 'uint256', internalType: 'uint256' }],
        outputs: [{ name: '', type: 'string', internalType: 'string' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getState',
        inputs: [{ name: 'capsuleId', type: 'uint256', internalType: 'uint256' }],
        outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'open',
        inputs: [{ name: 'capsuleId', type: 'uint256', internalType: 'uint256' }],
        outputs: [{ name: 'recipientCID', type: 'string', internalType: 'string' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'openExpired',
        inputs: [{ name: 'capsuleId', type: 'uint256', internalType: 'uint256' }],
        outputs: [{ name: 'publicCID', type: 'string', internalType: 'string' }],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'owner',
        inputs: [],
        outputs: [{ name: '', type: 'address', internalType: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'protocolBalance',
        inputs: [],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'totalCapsules',
        inputs: [],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'withdraw',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        name: 'CapsuleCreated',
        inputs: [
            { name: 'capsuleId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'sender', type: 'address', indexed: true, internalType: 'address' },
            { name: 'recipient', type: 'address', indexed: true, internalType: 'address' },
            { name: 'unlockTime', type: 'uint256', indexed: false, internalType: 'uint256' },
            { name: 'expiryTime', type: 'uint256', indexed: false, internalType: 'uint256' },
            { name: 'ethAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'CapsuleOpened',
        inputs: [
            { name: 'capsuleId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'opener', type: 'address', indexed: false, internalType: 'address' },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'ExpiredCapsuleOpened',
        inputs: [
            { name: 'capsuleId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'opener', type: 'address', indexed: false, internalType: 'address' },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'Withdrawn',
        inputs: [
            { name: 'owner', type: 'address', indexed: true, internalType: 'address' },
            { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
        anonymous: false,
    },
    {
        type: 'error',
        name: 'AlreadyExpired',
        inputs: [
            { name: 'capsuleId', type: 'uint256', internalType: 'uint256' },
            { name: 'expiryTime', type: 'uint256', internalType: 'uint256' },
        ],
    },
    {
        type: 'error',
        name: 'AlreadyOpened',
        inputs: [{ name: 'capsuleId', type: 'uint256', internalType: 'uint256' }],
    },
    {
        type: 'error',
        name: 'InsufficientPayment',
        inputs: [
            { name: 'required', type: 'uint256', internalType: 'uint256' },
            { name: 'provided', type: 'uint256', internalType: 'uint256' },
        ],
    },
    {
        type: 'error',
        name: 'NotExpiredYet',
        inputs: [
            { name: 'capsuleId', type: 'uint256', internalType: 'uint256' },
            { name: 'expiryTime', type: 'uint256', internalType: 'uint256' },
        ],
    },
    { type: 'error', name: 'NotOwner', inputs: [] },
    {
        type: 'error',
        name: 'NotRecipient',
        inputs: [{ name: 'capsuleId', type: 'uint256', internalType: 'uint256' }],
    },
    { type: 'error', name: 'NothingToWithdraw', inputs: [] },
    {
        type: 'error',
        name: 'StillLocked',
        inputs: [
            { name: 'capsuleId', type: 'uint256', internalType: 'uint256' },
            { name: 'unlockTime', type: 'uint256', internalType: 'uint256' },
        ],
    },
    { type: 'error', name: 'TransferFailed', inputs: [] },
];
export const CHAIN = baseSepolia;
//# sourceMappingURL=DriftBottle.js.map