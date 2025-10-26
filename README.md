# ToteFlow - Decentralized Marketplace with AI-Powered Yield Farming

## Description

1. ToteFlow is a decentralized digital product marketplace on Base chain with AI-powered yield farming
2. Sellers list products encrypted via Lit Protocol and stored on IPFS for secure content delivery
3. Buyers purchase using ERC20 tokens and decrypt content through Lit Protocol access control conditions
4. All seller funds automatically farm yield via Vincent AI agents across Aave, Compound, and Yearn
5. Hourly automated optimization: Vincent AI agents rebalance funds to the highest-yielding protocols
6. Real-time yield tracking with automatic protocol switching when better rates are detected
7. Farcaster mini dapp integration for social marketplace discovery and engagement
8. Yield accumulates during escrow period between purchase and content delivery
9. Smart contracts handle on-chain payments while Vincent AI manages off-chain DeFi operations
10. Comprehensive security: encrypted storage, access control, and ReentrancyGuard protection

## Technical Details

1. **Smart Contract**: Solidity 0.8.28 on Base Sepolia using OpenZeppelin (Ownable, ReentrancyGuard, SafeERC20)
2. **Vincent AI**: VincentYieldAgent class in Node.js/Express with per-user agents and multi-protocol optimization policies
3. **Lit Protocol**: @lit-protocol/lit-client for encryption with programmable access control conditions as JSON
4. **IPFS Storage**: Infura gateway for encrypted uploads with on-chain hash storage for immutable addressing
5. **Frontend**: Next.js 13 + TypeScript + Wagmi + Tailwind CSS + Farcaster Frame integration
6. **Vincent API**: REST endpoints calling Vincent agents for Aave V3, Compound, and Yearn transactions
7. **Automated Cron**: Hourly job triggering yield analysis and rebalancing when improvements exceed 1% threshold
8. **Access Control**: Lit Protocol EOA auth with signature-based conditions enabling wallet-based decryption
9. **Real-Time Rates**: Vincent agents fetch APY from multiple protocols for compound yield calculations
10. **Database**: MongoDB collections (users, deposits, products, purchases) tracking agent IDs and transaction hashes

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Marketplace   │────▶│  Smart       │────▶│  Vincent    │
│   (Frontend)    │     │  Contract    │     │  AI Agents  │
└─────────────────┘     └──────────────┘     └─────────────┘
         │                     │                     │
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Lit Protocol   │     │    IPFS      │     │   Aave /    │
│   Encryption    │     │   Storage    │     │  Compound   │
└─────────────────┘     └──────────────┘     └─────────────┘
```

## Key Features

- **🔐 Lit Protocol Encryption**: Automated content encryption with access control
- **🤖 Vincent AI Agents**: Per-user agents with automated multi-protocol optimization
- **🌾 Real Yield Farming**: Aave, Compound, and Yearn integration for actual DeFi yields
- **⏰ Hourly Optimization**: Automatic rebalancing across protocols for maximum returns
- **📱 Farcaster Integration**: Native mini dapp with Frame support
- **🌐 IPFS Storage**: Decentralized content hosting with encryption
- **💰 ERC20 Payments**: Multi-token support with automatic fee distribution
- **🔒 Secure Access Control**: Signature-based content decryption

## Quick Start

### Smart Contract
```bash
cd /Users/hemakarthick/tote/Tote
forge build
forge test
```

### Vincent App (Yield Farming)
```bash
cd vincent-app
npm install
cp env.example .env
# Configure VINCENT_API_KEY, VINCENT_AGENT_ID
npm start
```

### Mini Dapp (Frontend)
```bash
cd mini-dapp
npm install
cp env.example .env.local
# Configure environment variables
npm run dev
```

## Vincent AI Agent Capabilities

- **Auto-Protocol Selection**: Chooses best yielding protocol (Aave/Compound/Yearn)
- **Hourly Rebalancing**: Monitors rates and moves funds when better yields available
- **Slippage Protection**: 0.5% max slippage for safe transactions
- **Gas Optimization**: 50 gwei max gas price limits
- **Yield Threshold**: 1% minimum improvement before rebalancing

## License

MIT

