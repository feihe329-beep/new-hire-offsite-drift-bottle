import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'viem/chains'
import { coinbaseWallet, injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'DriftBottle',
      version: '4',
      preference: 'eoaOnly',
    }),
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
})
