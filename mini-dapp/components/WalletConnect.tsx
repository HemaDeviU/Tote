import { useState } from 'react'
import { useConnect } from 'wagmi'

export const WalletConnect = () => {
  const { connect, connectors, isPending } = useConnect()
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null)

  const handleConnect = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId)
    if (connector) {
      connect({ connector })
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🛍️ ToteFlow Marketplace
          </h2>
          <p className="text-gray-600">
            Connect your wallet to start buying and selling encrypted products
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Choose a wallet:
          </h3>
          
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => handleConnect(connector.id)}
              disabled={isPending}
              className="w-full flex items-center justify-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {connector.id === 'injected' && '🦊'}
                {connector.id === 'walletConnect' && '📱'}
                {connector.id === 'coinbaseWallet' && '🔵'}
              </div>
              <span className="font-medium">
                {connector.name}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🔒 Security Features</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Encrypted IPFS content with Lit Protocol</li>
            <li>• Decentralized marketplace on Base chain</li>
            <li>• Secure ERC20 token payments</li>
            <li>• Farcaster mini dapp integration</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
