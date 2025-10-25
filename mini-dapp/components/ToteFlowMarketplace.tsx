import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useLit } from '../contexts/LitContext'
import { ProductList } from './ProductList'
import { ProductForm } from './ProductForm'
import { PurchaseHistory } from './PurchaseHistory'
import { WalletConnect } from './WalletConnect'
import { LitAuth } from './LitAuth'

export const ToteFlowMarketplace = () => {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { litClient, authManager, isInitialized } = useLit()
  
  const [activeTab, setActiveTab] = useState<'browse' | 'list' | 'purchases' | 'yield'>('browse')
  const [isLitAuthenticated, setIsLitAuthenticated] = useState(false)

  // Check Lit authentication status
  useEffect(() => {
    if (authManager && address) {
      // Check if user is authenticated with Lit Protocol
      const checkAuth = async () => {
        try {
          // This would check if the user has valid auth context
          setIsLitAuthenticated(true)
        } catch (error) {
          setIsLitAuthenticated(false)
        }
      }
      checkAuth()
    }
  }, [authManager, address])

  if (!isConnected) {
    return <WalletConnect />
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Lit Protocol...</p>
        </div>
      </div>
    )
  }

  if (!isLitAuthenticated) {
    return <LitAuth onAuthenticated={() => setIsLitAuthenticated(true)} />
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to ToteFlow</h2>
            <p className="text-gray-600">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'browse'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🛍️ Browse Products
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'list'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ➕ List Product
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'purchases'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📦 My Purchases
          </button>
          <button
            onClick={() => setActiveTab('yield')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'yield'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💰 Yield Dashboard
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'browse' && <ProductList />}
        {activeTab === 'list' && <ProductForm />}
        {activeTab === 'purchases' && <PurchaseHistory />}
        {activeTab === 'yield' && <YieldDashboard />}
      </div>
    </div>
  )
}
