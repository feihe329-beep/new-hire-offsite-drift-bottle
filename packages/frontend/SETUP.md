# Drift Bottle Frontend - Setup Guide

## Project Overview

This is a complete React frontend for the DriftBottle onchain time capsule application. The frontend enables users to:
- Write time-locked messages with ETH
- View bottles sent to them
- Discover expired bottles in "The Pond"
- Track bottles they've created

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Web3 Integration**: wagmi v2 + viem
- **State Management**: TanStack React Query
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **Chain**: Base Sepolia

## Project Structure

```
packages/frontend/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component with routing
│   ├── index.css             # Global styles
│   ├── wagmi.ts              # Web3 config
│   ├── components/
│   │   ├── Navbar.tsx        # Navigation bar with wallet connection
│   │   └── CapsuleCard.tsx   # Reusable capsule display component
│   ├── pages/
│   │   ├── Landing.tsx       # Home page with hero and features
│   │   ├── WriteCapsule.tsx  # Form to create new capsules
│   │   ├── MyBottles.tsx     # User's created capsules
│   │   ├── ToMe.tsx          # Capsules sent to user
│   │   └── ThePond.tsx       # Expired/public capsules
│   └── contracts/
│       └── DriftBottle.ts    # Contract ABI and config
├── index.html                 # HTML template
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet

### Setup Steps

1. Install dependencies:
```bash
cd /Users/piaopingjiang/new-hire-offsite/drift-bottle/packages/frontend
npm install
```

If npm install hangs (due to network), try:
```bash
npm install --legacy-peer-deps --no-audit
```

2. Update the contract address in `src/contracts/DriftBottle.ts`:
```typescript
export const DRIFT_BOTTLE_ADDRESS = '0xYOUR_CONTRACT_ADDRESS' as const
```

3. Start development server:
```bash
npm run dev
```

The app will open at http://localhost:5173

4. Build for production:
```bash
npm run build
```

## Features

### Landing Page (`/`)
- Full-screen ocean background with animated waves
- Floating bottle emoji with bob animation
- Feature cards explaining the concept
- CTA button to create a message

### Write Capsule (`/write`)
- Message textarea with full UTF-8 support
- Recipient address input (Solidity address format)
- Optional ETH amount input
- Lock duration dropdown (demo: 1s/1m, production: 1mo-5yr)
- Form validation and transaction handling
- Success screen with capsule ID

### My Bottles (`/my-bottles`)
- Lists all capsules where sender == connected address
- Shows capsule state: Locked/Valid/Expired/Opened
- Displays recipient, ETH amount, unlock time
- Filters capsules client-side after fetching

### To Me (`/to-me`)
- Lists capsules where recipient == connected address
- "Open Bottle" button for valid (unlocked) capsules
- Displays decoded message after opening
- Shows countdown for still-locked capsules

### The Pond (`/pond`)
- Shows all expired capsules
- Sorted by ETH amount (highest first)
- "Open for 0.001 ETH" button to reveal messages
- Shows sender (truncated), amount, expiry time
- Empty state message when no expired capsules exist

### Navbar
- Logo with bottle emoji
- Navigation links to all pages
- "Connect Wallet" / "Disconnect" button
- Responsive mobile menu

## Styling

### Color Scheme (Ocean Theme)
- Background: `#020b18` (very dark navy)
- Card: `rgba(255,255,255,0.05)` (glassmorphism)
- Primary Accent: `#38bdf8` (sky blue)
- Secondary: `#818cf8` (indigo)
- Text: white / `#94a3b8`

### Key CSS Classes
- `.glass` - Glassmorphism effect (backdrop blur + border)
- `.glow` - Sky blue glow shadow
- `.text-gradient` - Gradient text effect
- `.spinner` - Loading animation
- `animate-wave` - Wave animation (custom)
- `animate-float` - Float animation (custom)

## Web3 Integration

### Wagmi Configuration
- **Connector**: injected() - MetaMask and compatible wallets
- **Chain**: baseSepolia
- **Transport**: HTTP RPC

### Contract Interaction
The frontend uses these contract functions:

**Read Functions:**
- `totalCapsules()` - Get total number of capsules
- `getCapsule(id)` - Get capsule details
- `getState(id)` - Get capsule state (0=locked, 1=valid, 2=expired)
- `getRecipientCID(id)` - Get recipient message
- `getPublicCID(id)` - Get public message
- `OPEN_PRICE()` - Get cost to open expired bottle

**Write Functions:**
- `createCapsule(recipient, recipientCID, publicCID, lockDuration)` - Create new capsule
- `open(capsuleId)` - Open as recipient
- `openExpired(capsuleId)` - Open expired bottle

### Message Encoding (Demo Mode)
Messages are encoded as base64 with "demo:" prefix:
```typescript
// Encoding
const encoded = 'demo:' + btoa(message)

// Decoding
const decoded = atob(encoded.replace('demo:', ''))
```

In production, replace with actual IPFS upload/retrieval.

## Configuration

### Update Contract Address
Edit `src/contracts/DriftBottle.ts`:
```typescript
export const DRIFT_BOTTLE_ADDRESS = '0x...' as const
```

### Update Chain
To use a different chain, modify:
1. `src/wagmi.ts` - Update chain in config
2. `src/contracts/DriftBottle.ts` - Update CHAIN import
3. `package.json` - Update any chain-specific dependencies

## Development Tips

- Hot Module Replacement (HMR) is enabled - edits refresh instantly
- TypeScript strict mode catches errors early
- Custom Tailwind colors defined in `tailwind.config.js`
- Framer Motion handles all animations smoothly
- React Router handles client-side navigation

## Troubleshooting

### npm install hangs
- Use `--legacy-peer-deps` flag
- Check npm registry connectivity
- Clear npm cache: `npm cache clean --force`

### Wallet not connecting
- Check MetaMask is unlocked
- Ensure you're on Base Sepolia network
- Try refreshing the page

### Transactions failing
- Verify contract address is correct
- Check wallet has sufficient funds
- Ensure you have testnet ETH for Base Sepolia

### Missing message after opening
- Verify contract returned valid CID string
- Check message encoding format (demo:base64)
- Inspect browser console for errors

## Future Enhancements

- [ ] IPFS integration for message storage
- [ ] ENS name resolution for recipient addresses
- [ ] Message encryption
- [ ] Batch operations
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Dark/Light theme toggle
- [ ] Internationalization (i18n)
