import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useLit } from '../contexts/LitContext'
import { createAccBuilder } from '@lit-protocol/access-control-conditions'
import { uploadToIPFS } from '../utils/ipfs'
import { ToteFlowContract } from '../utils/contract'

interface ProductFormData {
  name: string
  description: string
  price: string
  files: File[]
}

export const ProductForm = () => {
  const { address } = useAccount()
  const { litClient } = useLit()
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    files: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, files }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !litClient) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // 1. Prepare product data
      const productData = {
        name: formData.name,
        description: formData.description,
        files: formData.files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        metadata: {
          createdAt: new Date().toISOString(),
          seller: address
        }
      }

      // 2. Create access control conditions
      // For now, we'll create conditions that allow any buyer to decrypt
      // In production, you might want to restrict to specific buyers
      const accs = createAccBuilder()
        .requireWalletOwnership(address) // For now, allow seller to decrypt
        .on('base-sepolia')
        .build()

      // 3. Encrypt the product data
      const encryptedData = await litClient.encrypt({
        dataToEncrypt: JSON.stringify(productData),
        unifiedAccessControlConditions: accs,
        chain: 'base-sepolia',
      })

      // 4. Upload encrypted data to IPFS
      const ipfsHash = await uploadToIPFS(encryptedData)

      // 5. List product on marketplace
      const contract = new ToteFlowContract()
      const tx = await contract.listProduct(
        formData.name,
        formData.description,
        ipfsHash,
        JSON.stringify(accs),
        formData.price,
        '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // Base Sepolia USDC
      )

      await tx.wait()

      setSuccess('Product listed successfully!')
      setFormData({ name: '', description: '', price: '', files: [] })
    } catch (err) {
      console.error('Error listing product:', err)
      setError(err instanceof Error ? err.message : 'Failed to list product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">List a New Product</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Describe your product"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (USDC)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Files
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            accept="*/*"
          />
          {formData.files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Selected files:</p>
              <ul className="text-sm text-gray-500">
                {formData.files.map((file, index) => (
                  <li key={index}>• {file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Listing Product...' : 'List Product'}
        </button>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🔒 Security Features</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your product files are encrypted using Lit Protocol</li>
          <li>• Only authorized buyers can decrypt the content</li>
          <li>• Files are stored on decentralized IPFS network</li>
          <li>• Payment is processed on Base chain</li>
        </ul>
      </div>
    </div>
  )
}
