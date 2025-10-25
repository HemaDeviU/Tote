import { ethers } from 'ethers'
import { ToteFlow__factory } from '../contracts'

// Contract configuration for Base Sepolia testnet
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
const BASE_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'

export class ToteFlowContract {
  private contract: any
  private provider: ethers.Provider
  private signer: ethers.Signer | null = null

  constructor() {
    this.provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL)
    this.contract = ToteFlow__factory.connect(CONTRACT_ADDRESS, this.provider)
  }

  async connectSigner(signer: ethers.Signer) {
    this.signer = signer
    this.contract = this.contract.connect(signer)
  }

  // Product management
  async listProduct(
    name: string,
    description: string,
    ipfsHash: string,
    accessControlConditions: string,
    price: string,
    paymentToken: string
  ) {
    const priceWei = ethers.parseEther(price)
    return await this.contract.listProduct(
      name,
      description,
      ipfsHash,
      accessControlConditions,
      priceWei,
      paymentToken
    )
  }

  async purchaseProduct(productId: number) {
    return await this.contract.purchaseProduct(productId)
  }

  async shareIPFSLink(purchaseId: number) {
    return await this.contract.shareIPFSLink(purchaseId)
  }

  async deactivateProduct(productId: number) {
    return await this.contract.deactivateProduct(productId)
  }

  // View functions
  async getProduct(productId: number) {
    return await this.contract.getProduct(productId)
  }

  async getPurchase(purchaseId: number) {
    return await this.contract.getPurchase(purchaseId)
  }

  async getTotalProducts() {
    return await this.contract.getTotalProducts()
  }

  async getTotalPurchases() {
    return await this.contract.getTotalPurchases()
  }

  async getSellerProducts(seller: string) {
    return await this.contract.getSellerProducts(seller)
  }

  async getBuyerPurchases(buyer: string) {
    return await this.contract.getBuyerPurchases(buyer)
  }

  async getProductAndPurchaseData(purchaseId: number) {
    return await this.contract.getProductAndPurchaseData(purchaseId)
  }

  async getMarketplaceStats() {
    return await this.contract.getMarketplaceStats()
  }

  async getIPFSHash(purchaseId: number) {
    return await this.contract.getIPFSHash(purchaseId)
  }

  async getAccessControlConditions(purchaseId: number) {
    return await this.contract.getAccessControlConditions(purchaseId)
  }

  // Yield functions
  async withdrawYield(purchaseId: number) {
    return await this.contract.withdrawYield(purchaseId)
  }

  async calculateYield(amount: string, timeElapsed: number) {
    return await this.contract.calculateYield(amount, timeElapsed)
  }

  async getSellerYieldInfo(seller: string) {
    return await this.contract.getSellerYieldInfo(seller)
  }

  async getPurchaseYield(purchaseId: number) {
    return await this.contract.getPurchaseYield(purchaseId)
  }

  // Helper function to get latest purchase ID for a buyer
  async getLatestPurchaseId(buyer: string): Promise<number> {
    const purchases = await this.getBuyerPurchases(buyer)
    if (purchases.length === 0) {
      throw new Error('No purchases found')
    }
    return purchases[purchases.length - 1]
  }

  // Admin functions (only owner)
  async setAuthorizedToken(token: string, authorized: boolean) {
    return await this.contract.setAuthorizedToken(token, authorized)
  }

  async setPlatformFee(newFeeBps: number) {
    return await this.contract.setPlatformFee(newFeeBps)
  }

  async setFeeRecipient(newRecipient: string) {
    return await this.contract.setFeeRecipient(newRecipient)
  }
}
