import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useLit } from '../contexts/LitContext'
import { downloadFromIPFS } from '../utils/ipfs'
import { ToteFlowContract } from '../utils/contract'

interface Product {
  id: number
  seller: string
  name: string
  description: string
  ipfsHash: string
  accessControlConditions: string
  price: string
  paymentToken: string
  isActive: boolean
  createdAt: number
}

export const ProductList = () => {
  const { address } = useAccount()
  const { litClient, authManager } = useLit()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState<number | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const contract = new ToteFlowContract()
      const totalProducts = await contract.getTotalProducts()
      
      const productPromises = []
      for (let i = 1; i <= totalProducts; i++) {
        productPromises.push(contract.getProduct(i))
      }
      
      const productResults = await Promise.all(productPromises)
      setProducts(productResults.filter(p => p.isActive))
    } catch (err) {
      console.error('Error loading products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (productId: number) => {
    if (!address || !litClient || !authManager) return

    setPurchasing(productId)
    setError(null)

    try {
      // 1. Purchase the product
      const contract = new ToteFlowContract()
      const tx = await contract.purchaseProduct(productId)
      await tx.wait()

      // 2. Wait for seller to share IPFS link (in production, listen for events)
      // For demo purposes, we'll simulate this
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 3. Get purchase data
      const purchaseId = await contract.getLatestPurchaseId(address)
      const { product, purchase, canAccess } = await contract.getProductAndPurchaseData(purchaseId)

      if (canAccess) {
        // 4. Download and decrypt content
        const encryptedData = await downloadFromIPFS(product.ipfsHash)
        
        const decryptedData = await litClient.decrypt({
          data: encryptedData,
          unifiedAccessControlConditions: JSON.parse(product.accessControlConditions),
          authContext: await authManager.createEoaAuthContext({
            config: { account: address },
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

        // 5. Display decrypted content
        const productData = JSON.parse(decryptedData)
        alert(`Purchase successful! Decrypted content: ${JSON.stringify(productData, null, 2)}`)
      }
    } catch (err) {
      console.error('Error purchasing product:', err)
      setError(err instanceof Error ? err.message : 'Failed to purchase product')
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading products...</span>
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

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No products available</div>
        <p className="text-gray-400 mt-2">Be the first to list a product!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-green-600">
              {product.price} USDC
            </span>
            <span className="text-xs text-gray-500">
              ID: {product.id}
            </span>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            <p>Seller: {product.seller.slice(0, 6)}...{product.seller.slice(-4)}</p>
            <p>Listed: {new Date(product.createdAt * 1000).toLocaleDateString()}</p>
          </div>

          <button
            onClick={() => handlePurchase(product.id)}
            disabled={purchasing === product.id || product.seller === address}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {purchasing === product.id ? 'Purchasing...' : 
             product.seller === address ? 'Your Product' : 'Purchase'}
          </button>
        </div>
      ))}
    </div>
  )
}
