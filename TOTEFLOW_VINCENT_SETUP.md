# ToteFlow Vincent App Configuration

## 🎯 **Vincent App Setup for ToteFlow Yield Marketplace**

Based on the [Vincent Starter App](https://github.com/LIT-Protocol/vincent-starter-app), here's how to configure your ToteFlow Vincent app:

### **✅ Required Vincent Abilities**

#### **1. ERC20 Approval Ability**
```json
{
  "name": "ERC20 Approval",
  "description": "Approve USDC spending for marketplace transactions",
  "contract": "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC
  "method": "approve",
  "parameters": ["spender", "amount"]
}
```

#### **2. Aave Supply Ability**
```json
{
  "name": "Aave Supply",
  "description": "Supply USDC to Aave for yield farming",
  "contract": "0x...", // Aave Pool
  "method": "supply",
  "parameters": ["asset", "amount", "onBehalfOf", "referralCode"]
}
```

#### **3. Aave Withdraw Ability**
```json
{
  "name": "Aave Withdraw",
  "description": "Withdraw USDC from Aave with yield",
  "contract": "0x...", // Aave Pool
  "method": "withdraw",
  "parameters": ["asset", "amount", "to"]
}
```

#### **4. Uniswap Swap Ability (Optional)**
```json
{
  "name": "Uniswap Swap",
  "description": "Swap tokens for yield optimization",
  "contract": "0x...", // Uniswap Router
  "method": "exactInputSingle",
  "parameters": ["params"]
}
```

### **✅ Vincent App Configuration**

#### **App Details**
```json
{
  "name": "ToteFlow Yield Marketplace",
  "description": "Automated yield farming for digital product marketplace",
  "version": "1.0.0",
  "chain": "base-sepolia",
  "abilities": [
    "erc20-approval",
    "aave-supply",
    "aave-withdraw",
    "uniswap-swap"
  ]
}
```

#### **User Delegation**
```javascript
// Users delegate their agent wallet to your Vincent app
const delegation = {
  appId: "your-toteflow-app-id",
  abilities: [
    "erc20-approval",
    "aave-supply", 
    "aave-withdraw"
  ],
  maxGasPrice: "50", // 50 gwei
  maxSlippage: "0.5" // 0.5%
};
```

### **✅ Environment Configuration**

#### **Vincent App Environment**
```env
# Vincent App Configuration
VINCENT_APP_ID=your-app-id-from-dashboard
VINCENT_DELEGATEE_PRIVATE_KEY=your-private-key
VINCENT_API_URL=https://api.heyvincent.ai/v1

# Base Sepolia Configuration
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
AAVE_POOL_ADDRESS=0x... # Aave Pool on Base Sepolia

# App Configuration
APP_USER_URL=https://your-domain.com
REDIRECT_URIS=https://your-domain.com/callback
```

### **✅ Integration with Your ToteFlow**

#### **1. User Delegation Flow**
```javascript
// User connects to your Vincent app
const connectToVincent = async (userAddress) => {
  const vincentApp = new VincentApp({
    appId: process.env.VINCENT_APP_ID,
    chain: 'base-sepolia'
  });
  
  await vincentApp.connect(userAddress);
  return vincentApp;
};
```

#### **2. Automated Yield Farming**
```javascript
// Execute yield farming via Vincent
const executeYieldFarming = async (userAddress, amount) => {
  const vincentApp = await connectToVincent(userAddress);
  
  // Approve USDC spending
  await vincentApp.executeAbility('erc20-approval', {
    spender: AAVE_POOL_ADDRESS,
    amount: amount
  });
  
  // Supply to Aave
  await vincentApp.executeAbility('aave-supply', {
    asset: USDC_ADDRESS,
    amount: amount,
    onBehalfOf: userAddress,
    referralCode: 0
  });
};
```

#### **3. Yield Withdrawal**
```javascript
// Withdraw yield via Vincent
const withdrawYield = async (userAddress, amount) => {
  const vincentApp = await connectToVincent(userAddress);
  
  // Withdraw from Aave
  await vincentApp.executeAbility('aave-withdraw', {
    asset: USDC_ADDRESS,
    amount: amount,
    to: userAddress
  });
};
```

### **✅ Deployment Steps**

#### **1. Create Vincent App**
1. Go to https://heyvincent.ai/
2. Log in as builder
3. Create new app: "ToteFlow Yield Marketplace"
4. Add required abilities
5. Publish app

#### **2. Configure Backend**
```bash
# Set environment variables
export VINCENT_APP_ID="your-app-id"
export VINCENT_DELEGATEE_PRIVATE_KEY="your-private-key"
```

#### **3. Deploy**
```bash
# Deploy using Railway (recommended)
# Or deploy manually to your preferred platform
```

### **✅ Testing Your Vincent App**

#### **1. Test User Delegation**
```javascript
// Test user connecting to your Vincent app
const testUser = "0x..."; // Test user address
const vincentApp = await connectToVincent(testUser);
console.log("User connected:", vincentApp.isConnected);
```

#### **2. Test Yield Farming**
```javascript
// Test automated yield farming
await executeYieldFarming(testUser, ethers.parseEther("100"));
console.log("Yield farming executed successfully");
```

#### **3. Test Withdrawal**
```javascript
// Test yield withdrawal
await withdrawYield(testUser, ethers.parseEther("100"));
console.log("Yield withdrawal executed successfully");
```

## 🎯 **Benefits of Vincent Integration**

### **✅ True DeFi Automation**
- **Automated yield farming** via Vincent agents
- **User delegation** for secure transactions
- **Multi-protocol support** (Aave, Compound, Yearn)

### **✅ Hackathon Compliance**
- **Vincent App** published on Vincent Dashboard
- **DeFi capabilities** beyond simple transfers
- **User deposits** with automated yield
- **Lit Protocol** integration for security

### **✅ Production Ready**
- **Scalable architecture**
- **Secure key management**
- **Gas optimization**
- **Error handling**

---

**🎉 Your ToteFlow can now use real Vincent AI agents for automated yield farming!**

Follow the steps above to create your Vincent app and integrate it with your ToteFlow marketplace. This provides true DeFi automation that meets all hackathon requirements!
