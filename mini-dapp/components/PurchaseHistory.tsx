import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useLit } from '../contexts/LitContext'
import { downloadFromIPFS } from '../utils/ipfs'
import { ToteFlowContract } from '../utils/contract'

interface Purchase {
  productId: number
  buyer: string
  amountPaid: string
  timestamp: number
  ipfsShared: boolean
}

interface PurchaseWithProduct extends Purchase {
  product: {
    name: string
    description: string
    ipfsHash: string
    accessControlConditions: string
  }
}

export const PurchaseHistory = () => {
  const { address } = useAccount()
  const { litClient, authManager } = useLit()
  const [purchases, setPurchases] = useState<PurchaseWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [decrypting, setDecrypting] = useState<number | null>(null)

  useEffect(() => {
    if (address) {
      loadPurchases()
    }
  }, [address])

  const loadPurchases = async () => {
    try {
      const contract = new ToteFlowContract()
      const purchaseIds = await contract.getBuyerPurchases(address!)
      
      const purchasePromises = purchaseIds.map(async (purchaseId) => {
        const purchase = await contract.getPurchase(purchaseId)
        const product = await contract.getProduct(purchase.productId)
        return {
          ...purchase,
          product: {
            name: product.name,
            description: product.description,
            ipfsHash: product.ipfsHash,
            accessControlConditions: product.accessControlConditions
          }
        }
      })
      
      const purchaseResults = await Promise.all(purchasePromises)
      setPurchases(purchaseResults)
    } catch (err) {
      console.error('Error loading purchases:', err)
      setError('Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }

  const handleDecrypt = async (purchaseId: number) => {
    if (!litClient || !authManager) return

    setDecrypting(purchaseId)
    setError(null)

    try {
      const purchase = purchases.find(p => p.productId === purchaseId)
      if (!purchase || !purchase.ipfsShared) {
        throw new Error('IPFS link not shared yet')
      }

      // Download encrypted data from IPFS
      const encryptedData = await downloadFromIPFS(purchase.product.ipfsHash)
      
      // Decrypt using Lit Protocol
      const decryptedData = await litClient.decrypt({
        data: encryptedData,
        unifiedAccessControlConditions: JSON.parse(purchase.product.accessControlConditions),
        authContext: await authManager.createEoaAuthContext({
          config: { account: address! },
          authConfig: {
            domain: window.location.hostname,
            statement: 'Decrypt purchased product',
            expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            resources: [
              ['access-control-condition-decryption', '*']
            ]
          },
          litClient
        }),
          chain: 'base-sepolia',
      })

      // Display decrypted content
      const productData = JSON.parse(decryptedData)
      
      // Create a modal or new window to display the content
      const newWindow = window.open('', '_blank', 'width=800,height=600')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${purchase.product.name} - Decrypted Content</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h1>${purchase.product.name}</h1>
              <h2>Decrypted Content:</h2>
              <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
${JSON.stringify(productData, null, 2)}
              </pre>
            </body>
          </html>
        `)
      }
    } catch (err) {
      console.error('Error decrypting content:', err)
      setError(err instanceof Error ? err.message : 'Failed to decrypt content')
    } finally {
      setDecrypting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading purchases...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
          {error}
        </div>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No purchases found</div>
        <p className="text-gray-400 mt-2">Start browsing products to make your first purchase!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-6">Your Purchase History</h3>
      
      {purchases.map((purchase) => (
        <div key={purchase.productId} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {purchase.product.name}
              </h4>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {purchase.product.description}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Amount: {purchase.amountPaid} USDC</span>
                <span>Date: {new Date(purchase.timestamp * 1000).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  purchase.ipfsShared 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {purchase.ipfsShared ? 'IPFS Shared' : 'Pending IPFS'}
                </span>
              </div>
            </div>
            
            <div className="ml-4">
              <button
                onClick={() => handleDecrypt(purchase.productId)}
                disabled={!purchase.ipfsShared || decrypting === purchase.productId}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {decrypting === purchase.productId ? 'Decrypting...' : 'Decrypt Content'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
