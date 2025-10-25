import { createContext, useContext, ReactNode } from 'react'
import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { WagmiProvider as WagmiProviderBase } from 'wagmi'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Base chain configuration
const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    }),
    coinbaseWallet({
      appName: 'ToteFlow Marketplace',
    }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
})

interface WagmiProviderProps {
  children: ReactNode
}

export const WagmiProvider = ({ children }: WagmiProviderProps) => {
  return (
    <WagmiProviderBase config={config}>
      {children}
    </WagmiProviderBase>
  )
}
