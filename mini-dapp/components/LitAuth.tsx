import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useLit } from '../contexts/LitContext'

interface LitAuthProps {
  onAuthenticated: () => void
}

export const LitAuth = ({ onAuthenticated }: LitAuthProps) => {
  const { address } = useAccount()
  const { authManager, litClient } = useLit()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuthenticate = async () => {
    if (!authManager || !litClient || !address) return

    setIsAuthenticating(true)
    setError(null)

    try {
      // Create authentication context for Lit Protocol
      const authContext = await authManager.createEoaAuthContext({
        config: {
          account: address,
        },
        authConfig: {
          domain: window.location.hostname,
          statement: 'Access ToteFlow Marketplace with encrypted content',
          expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
          resources: [
            ['access-control-condition-decryption', '*'],
            ['lit-action-execution', '*']
          ]
        },
        litClient
      })

      console.log('✅ Lit Protocol authentication successful')
      onAuthenticated()
    } catch (err) {
      console.error('❌ Lit Protocol authentication failed:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🔐 Lit Protocol Authentication
          </h2>
          <p className="text-gray-600">
            Authenticate with Lit Protocol to access encrypted content
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Why authenticate?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Decrypt purchased product content</li>
              <li>• Access encrypted IPFS files</li>
              <li>• Secure content sharing</li>
              <li>• Privacy protection</li>
            </ul>
          </div>

          <button
            onClick={handleAuthenticate}
            disabled={isAuthenticating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAuthenticating ? 'Authenticating...' : 'Authenticate with Lit Protocol'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Connected wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
