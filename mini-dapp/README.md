# ToteFlow Marketplace - Farcaster Mini Dapp

A decentralized marketplace built on Base chain with Lit Protocol encryption for secure IPFS content sharing.

## Features

- 🔒 **Encrypted IPFS Content**: Products are encrypted using Lit Protocol before storing on IPFS
- 🛍️ **Decentralized Marketplace**: Buy and sell products using ERC20 tokens on Base chain
- 📱 **Farcaster Integration**: Native Farcaster mini dapp with Frame support
- 🔐 **Access Control**: Programmable access control conditions for content decryption
- ⚡ **Base Chain**: Low fees and fast transactions on Base network

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Blockchain**: Base Chain (Ethereum L2)
- **Encryption**: Lit Protocol
- **Storage**: IPFS
- **Wallet**: Wagmi, WalletConnect, Coinbase Wallet
- **Social**: Farcaster Frames

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Base chain RPC access
- IPFS node access
- Lit Protocol API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mini-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure environment variables:
```env
# Base Chain
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# IPFS
NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001/api/v0
NEXT_PUBLIC_IPFS_AUTH=Basic <base64-encoded-auth>

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# App
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

5. Run the development server:
```bash
npm run dev
```

## Usage

### For Sellers

1. Connect your wallet
2. Authenticate with Lit Protocol
3. Navigate to "List Product"
4. Upload product files (they'll be encrypted automatically)
5. Set price and payment token
6. List your product

### For Buyers

1. Connect your wallet
2. Authenticate with Lit Protocol
3. Browse available products
4. Purchase products with ERC20 tokens
5. Decrypt and access purchased content

### Farcaster Integration

The app includes Farcaster Frame support:

- Browse products directly in Farcaster
- View purchase history
- Access marketplace features

## Smart Contract Integration

The mini dapp integrates with the ToteFlow smart contract deployed on Base chain:

```typescript
// Example usage
const contract = new ToteFlowContract()
await contract.listProduct(name, description, ipfsHash, accessConditions, price, token)
```

## Lit Protocol Integration

Content is encrypted using Lit Protocol with access control conditions:

```typescript
// Create access control conditions
const accs = createAccBuilder()
  .requireWalletOwnership(buyerAddress)
  .on('base')
  .build()

// Encrypt content
const encryptedData = await litClient.encrypt({
  dataToEncrypt: productData,
  unifiedAccessControlConditions: accs,
  chain: 'base',
})
```

## IPFS Integration

Files are stored on IPFS after encryption:

```typescript
// Upload encrypted data to IPFS
const ipfsHash = await uploadToIPFS(encryptedData)

// Download and decrypt
const encryptedData = await downloadFromIPFS(ipfsHash)
const decryptedData = await litClient.decrypt({...})
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `out` folder to your hosting provider

## Security Considerations

- All product content is encrypted before IPFS storage
- Access control conditions are enforced by Lit Protocol
- Smart contract handles payments securely
- Private keys never leave the user's wallet

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Follow us on Farcaster

---

Built with ❤️ for the decentralized future
