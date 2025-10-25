# 🚀 ToteFlow Yield Marketplace - Complete Deployment Guide

## 🎯 **What We Built**

A **"Delayed Withdrawal Yield Marketplace"** that combines:
- **Digital product marketplace** with IPFS content
- **Lit Protocol encryption** for secure content sharing
- **DeFi yield farming** for sellers
- **Farcaster mini dapp** integration

## 💡 **How It Works**

1. **Seller lists** digital product (course, software, art, etc.)
2. **Buyer purchases** with USDC
3. **Seller shares IPFS link** → Payment released to seller
4. **Seller chooses** to withdraw immediately OR let it yield
5. **If seller waits** → Funds automatically yield in DeFi (10% annual)
6. **Seller withdraws** whenever → Gets original + yield (minus 20% platform fee)

## 🛠️ **Deployment Steps**

### **Step 1: Deploy Smart Contract to Base Sepolia**

```bash
# Navigate to contract directory
cd /Users/hemakarthick/tote/Tote

# Set environment variables
export PRIVATE_KEY="your-private-key"
export BASESCAN_API_KEY="your-basescan-api-key"

# Deploy to Base Sepolia
forge create --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --etherscan-api-key $BASESCAN_API_KEY \
  --verify \
  src/Tote.sol:ToteFlow

# Note the deployed contract address
```

### **Step 2: Authorize USDC Token**

```bash
# Authorize USDC for payments
cast send [CONTRACT_ADDRESS] \
  "setAuthorizedToken(address,bool)" \
  0x036CbD53842c5426634e7929541eC2318f3dCF7e true \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY
```

### **Step 3: Configure Mini Dapp**

```bash
# Navigate to mini dapp directory
cd mini-dapp

# Install dependencies
npm install

# Create environment file
cp env.example .env.local
```

### **Step 4: Set Environment Variables**

```env
# Base Sepolia Configuration
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CONTRACT_ADDRESS=0x[YOUR_DEPLOYED_CONTRACT_ADDRESS]

# IPFS Configuration (Pinata)
NEXT_PUBLIC_IPFS_URL=https://api.pinata.cloud
NEXT_PUBLIC_IPFS_AUTH=Bearer [YOUR_PINATA_JWT_TOKEN]

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=[YOUR_PROJECT_ID]

# App Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### **Step 5: Deploy Mini Dapp**

```bash
# Build the application
npm run build

# Deploy to Vercel
npx vercel --prod

# Or deploy to Netlify
# Upload 'out' folder to Netlify
```

## 🎮 **Testing the Complete Flow**

### **1. Seller Flow**
1. **Connect wallet** (MetaMask with Base Sepolia)
2. **Authenticate** with Lit Protocol
3. **List product** with encrypted IPFS content
4. **Wait for purchase**
5. **Share IPFS link** → Starts yield farming
6. **Monitor yield** in Yield Dashboard
7. **Withdraw** when ready (original + yield)

### **2. Buyer Flow**
1. **Connect wallet** (MetaMask with Base Sepolia)
2. **Authenticate** with Lit Protocol
3. **Browse products**
4. **Purchase** with USDC
5. **Wait for IPFS link**
6. **Decrypt content** using Lit Protocol

### **3. Yield Flow**
1. **After IPFS sharing** → Funds start yielding
2. **Yield accumulates** at 10% annual rate
3. **Seller withdraws** → Gets 80% of yield
4. **Platform earns** → 20% of yield as fee

## 🔧 **Key Features**

### **Smart Contract Features**
- ✅ **Product listing** with IPFS hash and access control
- ✅ **Purchase flow** with platform fees
- ✅ **Yield farming** after IPFS sharing
- ✅ **Flexible withdrawal** system
- ✅ **Yield calculation** based on time
- ✅ **Admin controls** for yield rates and fees

### **Frontend Features**
- ✅ **Farcaster mini dapp** with Frame support
- ✅ **Lit Protocol integration** for encryption
- ✅ **Yield dashboard** for sellers
- ✅ **Purchase history** for buyers
- ✅ **Real-time yield tracking**
- ✅ **Responsive design** with Tailwind CSS

### **DeFi Features**
- ✅ **Automated yield farming** (10% annual)
- ✅ **Platform fee** (20% of yield)
- ✅ **Flexible withdrawal** timing
- ✅ **Yield compounding** while waiting
- ✅ **Risk management** with time-based yields

## 📊 **Yield Economics**

- **Annual Yield Rate**: 10%
- **Platform Fee**: 20% of yield
- **Seller Gets**: 80% of yield
- **Minimum Hold**: No minimum (can withdraw immediately)
- **Maximum Hold**: Unlimited (yield continues)

## 🎯 **Hackathon Compliance**

✅ **Vincent App**: Can be built as Vincent app with automated yield farming
✅ **DeFi Capabilities**: Automated yield farming beyond simple ERC20 transfers
✅ **User Deposits**: Sellers deposit funds that yield automatically
✅ **Automated Transactions**: Bot manages all yield farming operations

## 🚀 **Next Steps**

1. **Deploy to Base Sepolia** (testnet)
2. **Test complete flow** with real transactions
3. **Optimize yield rates** based on market conditions
4. **Deploy to Base Mainnet** when ready
5. **Submit to hackathon** as Vincent app

## 💰 **Revenue Model**

- **Platform Fee**: 2.5% on purchases
- **Yield Fee**: 20% of generated yield
- **Sustainable**: Ongoing revenue from yield farming

---

**Your ToteFlow Yield Marketplace is now complete and ready for deployment!** 🎉

The combination of **digital product marketplace + DeFi yield farming + Lit Protocol encryption + Farcaster integration** creates a unique and innovative platform that meets all hackathon requirements while providing real value to users.
