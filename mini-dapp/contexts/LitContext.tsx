import { createContext, useContext, ReactNode } from 'react'
import { LitClient } from '@lit-protocol/lit-client'
import { AuthManager } from '@lit-protocol/auth'

interface LitContextType {
  litClient: LitClient | null
  authManager: AuthManager | null
  isInitialized: boolean
  initializeLit: () => Promise<void>
}

const LitContext = createContext<LitContextType | undefined>(undefined)

export const useLit = () => {
  const context = useContext(LitContext)
  if (context === undefined) {
    throw new Error('useLit must be used within a LitProvider')
  }
  return context
}

interface LitProviderProps {
  children: ReactNode
}

export const LitProvider = ({ children }: LitProviderProps) => {
  const [litClient, setLitClient] = useState<LitClient | null>(null)
  const [authManager, setAuthManager] = useState<AuthManager | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const initializeLit = async () => {
    try {
      // Initialize Lit Client for Base Sepolia testnet
      const client = new LitClient({
        litNetwork: 'manzano', // Use 'manzano' for testnet
        debug: process.env.NODE_ENV === 'development'
      })

      await client.connect()

      // Initialize Auth Manager
      const auth = new AuthManager({
        litClient: client,
        authConfig: {
          domain: window.location.hostname,
          statement: 'Access ToteFlow Marketplace',
          expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
          resources: [
            ['access-control-condition-decryption', '*'],
            ['lit-action-execution', '*']
          ]
        }
      })

      await auth.init()

      setLitClient(client)
      setAuthManager(auth)
      setIsInitialized(true)

      console.log('✅ Lit Protocol initialized for Base chain')
    } catch (error) {
      console.error('❌ Failed to initialize Lit Protocol:', error)
    }
  }

  useEffect(() => {
    initializeLit()
  }, [])

  const value = {
    litClient,
    authManager,
    isInitialized,
    initializeLit
  }

  return (
    <LitContext.Provider value={value}>
      {children}
    </LitContext.Provider>
  )
}
