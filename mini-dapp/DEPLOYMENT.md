# ToteFlow Marketplace - Deployment Guide

## Quick Start

1. **Deploy Smart Contract to Base**:
```bash
cd /Users/hemakarthick/tote/Tote
forge create --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY \
  src/Tote.sol:ToteFlow
```

2. **Deploy Mini Dapp**:
```bash
cd mini-dapp
npm install
npm run build
# Deploy to Vercel, Netlify, or your preferred platform
```

## Environment Setup

### Required Environment Variables

```env
# Base Chain
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CONTRACT_ADDRESS=0x[YOUR_CONTRACT_ADDRESS]

# IPFS
NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001/api/v0
NEXT_PUBLIC_IPFS_AUTH=Basic [BASE64_ENCODED_AUTH]

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=[YOUR_PROJECT_ID]

# App
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Getting API Keys

1. **IPFS (Infura)**:
   - Sign up at https://infura.io
   - Create IPFS project
   - Get API key and secret

2. **WalletConnect**:
   - Sign up at https://cloud.walletconnect.com
   - Create project
   - Get Project ID

3. **Base RPC**:
   - Use public RPC: `https://mainnet.base.org`
   - Or get dedicated RPC from Alchemy/Infura

## Deployment Platforms

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Netlify

1. Connect repository
2. Set build command: `npm run build`
3. Set publish directory: `out`
4. Set environment variables

### Manual Deployment

1. Build: `npm run build`
2. Upload `out` folder to hosting provider
3. Configure environment variables

## Farcaster Integration

### Frame Configuration

Your Farcaster Frame URL should be:
```
https://your-domain.com/api/frame
```

### Testing Frames

Use Farcaster's frame validator:
- https://warpcast.com/~/developers/frames

## Security Checklist

- [ ] Smart contract deployed and verified
- [ ] Environment variables secured
- [ ] IPFS access properly configured
- [ ] Lit Protocol integration tested
- [ ] Wallet connections working
- [ ] Frame validation passing

## Monitoring

- Monitor contract events
- Track IPFS uploads/downloads
- Monitor Lit Protocol usage
- Check frame interactions

## Support

For issues:
1. Check console logs
2. Verify environment variables
3. Test on Base testnet first
4. Check contract deployment
