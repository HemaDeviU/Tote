import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ToteFlowContract } from '../utils/contract'

interface SellerYield {
  seller: string
  totalDeposited: string
  totalYieldEarned: string
  lastUpdateTime: number
  isActive: boolean
}

interface Purchase {
  productId: number
  buyer: string
  amountPaid: string
  timestamp: number
  ipfsShared: boolean
  withdrawn: boolean
  yieldAccumulated: string
  yieldStartTime: number
}

export const YieldDashboard = () => {
  const { address } = useAccount()
  const [sellerYield, setSellerYield] = useState<SellerYield | null>(null)
  const [pendingPurchases, setPendingPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState<number | null>(null)

  useEffect(() => {
    if (address) {
      loadYieldData()
    }
  }, [address])

  const loadYieldData = async () => {
    try {
      const contract = new ToteFlowContract()
      
      // Get seller yield info
      const yieldInfo = await contract.getSellerYieldInfo(address!)
      setSellerYield(yieldInfo)

      // Get seller's products to find pending purchases
      const productIds = await contract.getSellerProducts(address!)
      
      const purchasePromises = []
      for (const productId of productIds) {
        // Get all purchases for this product
        const totalPurchases = await contract.getTotalPurchases()
        for (let i = 1; i <= totalPurchases; i++) {
          try {
            const purchase = await contract.getPurchase(i)
            if (purchase.productId === productId && purchase.ipfsShared && !purchase.withdrawn) {
              purchasePromises.push(Promise.resolve(purchase))
            }
          } catch (err) {
            // Skip invalid purchase IDs
          }
        }
      }
      
      const purchases = await Promise.all(purchasePromises)
      setPendingPurchases(purchases)
    } catch (err) {
      console.error('Error loading yield data:', err)
      setError('Failed to load yield data')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawYield = async (purchaseId: number) => {
    if (!address) return

    setWithdrawing(purchaseId)
    setError(null)

    try {
      const contract = new ToteFlowContract()
      const tx = await contract.withdrawYield(purchaseId)
      await tx.wait()

      // Reload data
      await loadYieldData()
    } catch (err) {
      console.error('Error withdrawing yield:', err)
      setError(err instanceof Error ? err.message : 'Failed to withdraw yield')
    } finally {
      setWithdrawing(null)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const formatAmount = (amount: string) => {
    return (parseFloat(amount) / 1e18).toFixed(4)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading yield data...</span>
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

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-6">💰 Yield Dashboard</h3>
      
      {/* Seller Yield Summary */}
      {sellerYield && sellerYield.isActive && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-green-900 mb-4">Your Yield Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(sellerYield.totalDeposited)} USDC
              </div>
              <div className="text-sm text-green-700">Total Deposited</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatAmount(sellerYield.totalYieldEarned)} USDC
              </div>
              <div className="text-sm text-blue-700">Total Yield Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {sellerYield.totalDeposited !== '0' 
                  ? ((parseFloat(sellerYield.totalYieldEarned) / parseFloat(sellerYield.totalDeposited)) * 100).toFixed(2)
                  : '0.00'
                }%
              </div>
              <div className="text-sm text-purple-700">Total ROI</div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Withdrawals */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Pending Yield Withdrawals</h4>
        
        {pendingPurchases.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">No pending yield withdrawals</div>
            <p className="text-gray-400 mt-2">Sell products to start earning yield!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPurchases.map((purchase) => (
              <div key={purchase.productId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Product #{purchase.productId}
                        </div>
                        <div className="text-sm text-gray-600">
                          Amount: {formatAmount(purchase.amountPaid)} USDC
                        </div>
                        <div className="text-sm text-gray-600">
                          Yield Started: {formatTime(purchase.yieldStartTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={() => handleWithdrawYield(purchase.productId)}
                      disabled={withdrawing === purchase.productId}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {withdrawing === purchase.productId ? 'Withdrawing...' : 'Withdraw Yield'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Yield Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-2">💡 How Yield Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• After sharing IPFS link, your payment starts earning yield</li>
          <li>• Yield accumulates automatically while funds are held</li>
          <li>• You can withdraw anytime to get original amount + yield</li>
          <li>• Platform keeps 20% of yield as automation fee</li>
          <li>• Current annual yield rate: 10%</li>
        </ul>
      </div>
    </div>
  )
}
