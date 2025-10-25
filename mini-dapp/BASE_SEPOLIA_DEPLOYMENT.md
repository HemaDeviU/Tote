# ToteFlow Marketplace - Base Sepolia Deployment Guide

## 🚀 Quick Deployment to Base Sepolia Testnet

### Prerequisites

1. **Get Base Sepolia ETH**:
   - Visit [Base Sepolia Faucet](https://bridge.base.org/deposit)
   - Or use [Alchemy Faucet](https://sepoliafaucet.com/)
   - You need ETH for gas fees

2. **Get Base Sepolia USDC**:
   - Contract: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
   - Use [Base Sepolia Bridge](https://bridge.base.org/) to bridge USDC

3. **Required API Keys**:
   - WalletConnect Project ID
   - IPFS access (Infura recommended)
   - BaseScan API key (optional, for verification)

### Step 1: Deploy Smart Contract

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

### Step 2: Configure Mini Dapp

```bash
# Navigate to mini dapp directory
cd mini-dapp

# Install dependencies
npm install

# Create environment file
cp env.example .env.local
```

### Step 3: Set Environment Variables

```env
# Base Sepolia Configuration
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CONTRACT_ADDRESS=0x[YOUR_DEPLOYED_CONTRACT_ADDRESS]

# IPFS Configuration
NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001/api/v0
NEXT_PUBLIC_IPFS_AUTH=Basic [BASE64_ENCODED_AUTH]

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=[YOUR_PROJECT_ID]

# App Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Step 4: Authorize USDC Token

After deploying, authorize USDC token for payments:

```bash
# Use cast to call setAuthorizedToken
cast send [CONTRACT_ADDRESS] \
  "setAuthorizedToken(address,bool)" \
  0x036CbD53842c5426634e7929541eC2318f3dCF7e true \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY
```

### Step 5: Deploy Mini Dapp

```bash
# Build the application
npm run build

# Deploy to Vercel (recommended)
npx vercel --prod

# Or deploy to Netlify
npm run build
# Upload 'out' folder to Netlify
```

### Step 6: Test the Complete Flow

1. **Connect Wallet**:
   - Use MetaMask with Base Sepolia network
   - Ensure you have ETH for gas and USDC for purchases

2. **List a Product**:
   - Upload files (they'll be encrypted)
   - Set price in USDC
   - Confirm transaction

3. **Purchase Product**:
   - Browse available products
   - Purchase with USDC
   - Decrypt content after purchase

### Base Sepolia Network Details

- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **USDC Contract**: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

### Testing Checklist

- [ ] Contract deployed and verified
- [ ] USDC token authorized
- [ ] Mini dapp deployed and accessible
- [ ] Wallet connection working
- [ ] Product listing successful
- [ ] Purchase flow working
- [ ] Content decryption successful
- [ ] Farcaster Frame integration working

### Troubleshooting

1. **Transaction Failures**:
   - Check gas fees (Base Sepolia is cheap)
   - Ensure sufficient ETH balance
   - Verify contract address

2. **Lit Protocol Issues**:
   - Use 'manzano' network for testnet
   - Check access control conditions
   - Verify authentication

3. **IPFS Issues**:
   - Check API credentials
   - Verify file upload limits
   - Test with small files first

### Next Steps

1. Test thoroughly on Base Sepolia
2. Fix any issues
3. Deploy to Base Mainnet when ready
4. Submit to Farcaster mini dapp directory

---

**Base Sepolia Resources**:
- [Base Sepolia Bridge](https://bridge.base.org/)
- [Base Sepolia Faucet](https://bridge.base.org/deposit)
- [Base Sepolia Explorer](https://sepolia.basescan.org)
- [Base Documentation](https://docs.base.org/)
