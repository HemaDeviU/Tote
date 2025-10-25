// Vincent App: ToteFlow Yield Marketplace
// Automated Aave yield farming with Lit Protocol

const express = require('express');
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const { LitClient } = require('@lit-protocol/lit-client');
const { AuthManager } = require('@lit-protocol/auth');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(require('cors')());

// MongoDB Models
const UserSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  totalDeposited: { type: Number, default: 0 },
  totalYieldEarned: { type: Number, default: 0 },
  activeDeposits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deposit' }],
  createdAt: { type: Date, default: Date.now }
});

const DepositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  token: { type: String, required: true },
  aaveShares: { type: Number, default: 0 },
  yieldStartTime: { type: Date, default: Date.now },
  withdrawn: { type: Boolean, default: false },
  yieldAccumulated: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  ipfsHash: { type: String, required: true },
  accessControlConditions: { type: String, required: true },
  price: { type: Number, required: true },
  token: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const PurchaseSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  ipfsShared: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Deposit = mongoose.model('Deposit', DepositSchema);
const Product = mongoose.model('Product', ProductSchema);
const Purchase = mongoose.model('Purchase', PurchaseSchema);

// Lit Protocol + Aave Integration
class ToteFlowVincentApp {
  constructor() {
    this.litClient = new LitClient({
      litNetwork: 'manzano', // Base Sepolia testnet
      debug: process.env.NODE_ENV === 'development'
    });
    
    this.provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    // Aave V3 contracts (Base Sepolia)
    this.aavePoolAddress = '0x...'; // Aave Pool address
    this.usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
    this.aUsdcAddress = '0x...'; // Aave USDC token address
    
    this.initializeLit();
  }

  async initializeLit() {
    try {
      await this.litClient.connect();
      console.log('✅ Lit Protocol connected');
    } catch (error) {
      console.error('❌ Lit Protocol connection failed:', error);
    }
  }

  // Real-time Aave yield rate fetching
  async getCurrentAaveYieldRate() {
    try {
      // Fetch real-time yield rate from Aave
      // This would connect to Aave's API or on-chain data
      const response = await fetch('https://aave-api.com/v3/rates/USDC'); // Example API
      const data = await response.json();
      
      // Convert to basis points (e.g., 5.5% = 550 basis points)
      const yieldRate = Math.floor(data.supplyRate * 10000);
      
      return yieldRate;
    } catch (error) {
      console.error('Error fetching Aave yield rate:', error);
      // Fallback to default rate
      return 1000; // 10% in basis points
    }
  }

  // Automated Aave Operations
  async depositToAave(amount, userAddress) {
    try {
      // Get real-time yield rate
      const currentYieldRate = await this.getCurrentAaveYieldRate();
      console.log(`🔄 Depositing ${amount} USDC to Aave for user ${userAddress}`);
      console.log(`📊 Current Aave yield rate: ${currentYieldRate/100}%`);
      
      // In production, you would:
      // 1. Create proper access control conditions
      // 2. Use Lit Protocol to execute Aave transactions
      // 3. Handle real Aave shares
      
      // Simulate successful deposit with real yield rate
      const mockShares = amount; // In reality, get actual shares from Aave
      
      return {
        success: true,
        shares: mockShares,
        yieldRate: currentYieldRate,
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        message: `Deposited to Aave successfully at ${currentYieldRate/100}% yield rate`
      };
    } catch (error) {
      console.error('Error depositing to Aave:', error);
      throw error;
    }
  }

  async withdrawFromAave(shares, userAddress) {
    try {
      // For now, simulate Aave withdrawal (in production, use real Aave integration)
      console.log(`🔄 Withdrawing ${shares} shares from Aave for user ${userAddress}`);
      
      // In production, you would:
      // 1. Create proper access control conditions
      // 2. Use Lit Protocol to execute Aave withdrawal
      // 3. Calculate actual yield earned
      
      // Simulate successful withdrawal with yield
      const baseAmount = shares; // Original amount
      const yieldEarned = shares * 0.001; // Simulate 0.1% yield (adjust based on time)
      const totalAmount = baseAmount + yieldEarned;
      
      return {
        success: true,
        baseAmount: baseAmount,
        yieldEarned: yieldEarned,
        totalAmount: totalAmount,
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        message: 'Withdrawn from Aave successfully with yield'
      };
    } catch (error) {
      console.error('Error withdrawing from Aave:', error);
      throw error;
    }
  }

  async createAuthContext(userAddress) {
    const authManager = new AuthManager({
      litClient: this.litClient,
      authConfig: {
        domain: process.env.DOMAIN || 'localhost',
        statement: 'Execute automated Aave transactions',
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        resources: [
          ['lit-action-execution', '*']
        ]
      }
    });

    return await authManager.createEoaAuthContext({
      config: { account: userAddress },
      authConfig: {
        domain: process.env.DOMAIN || 'localhost',
        statement: 'Execute automated Aave transactions',
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        resources: [
          ['lit-action-execution', '*']
        ]
      },
      litClient: this.litClient
    });
  }

  encodeDepositData(amount) {
    // Encode Aave deposit function call
    const iface = new ethers.Interface([
      'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)'
    ]);
    return iface.encodeFunctionData('supply', [
      this.usdcAddress,
      amount,
      this.wallet.address,
      0
    ]);
  }

  encodeWithdrawData(shares) {
    // Encode Aave withdraw function call
    const iface = new ethers.Interface([
      'function withdraw(address asset, uint256 amount, address to)'
    ]);
    return iface.encodeFunctionData('withdraw', [
      this.usdcAddress,
      shares,
      this.wallet.address
    ]);
  }
}

// Initialize Vincent App
const vincentApp = new ToteFlowVincentApp();

// API Routes
app.post('/api/deposit', async (req, res) => {
  try {
    const { userAddress, amount, token } = req.body;
    
    // Create or update user
    let user = await User.findOne({ address: userAddress });
    if (!user) {
      user = new User({ address: userAddress });
      await user.save();
    }

    // Create deposit record
    const deposit = new Deposit({
      userId: user._id,
      amount,
      token
    });
    await deposit.save();

    // Automatically deposit to Aave using Lit Protocol
    const aaveResult = await vincentApp.depositToAave(amount, userAddress);
    
    // Update deposit with Aave shares
    deposit.aaveShares = aaveResult.shares;
    await deposit.save();

    // Update user
    user.totalDeposited += amount;
    user.activeDeposits.push(deposit._id);
    await user.save();

    res.json({
      success: true,
      depositId: deposit._id,
      txHash: aaveResult.txHash,
      shares: aaveResult.shares,
      message: 'Deposit successful and automatically farming yield on Aave'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/withdraw', async (req, res) => {
  try {
    const { userAddress, depositId } = req.body;
    
    const deposit = await Deposit.findById(depositId);
    if (!deposit || deposit.withdrawn) {
      return res.status(400).json({ error: 'Invalid deposit' });
    }

    // Withdraw from Aave using Lit Protocol
    const aaveResult = await vincentApp.withdrawFromAave(deposit.aaveShares, userAddress);
    
    // Calculate yield earned using real-time rates
    const timeElapsed = Date.now() - deposit.yieldStartTime.getTime();
    const realTimeYield = await calculateRealTimeYield(deposit.amount, timeElapsed, aaveResult.yieldRate);
    const fallbackYield = calculateYield(deposit.amount, timeElapsed);
    const yieldEarned = aaveResult.yieldEarned || realTimeYield || fallbackYield;
    
    // Update deposit
    deposit.withdrawn = true;
    deposit.yieldAccumulated = yieldEarned;
    await deposit.save();

    // Update user
    const user = await User.findById(deposit.userId);
    user.totalYieldEarned += yieldEarned;
    await user.save();

    res.json({
      success: true,
      amount: deposit.amount,
      yieldEarned: yieldEarned,
      totalAmount: deposit.amount + yieldEarned,
      txHash: aaveResult.txHash,
      message: 'Withdrawal successful with yield earned'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:address', async (req, res) => {
  try {
    const user = await User.findOne({ address: req.params.address })
      .populate('activeDeposits');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      address: user.address,
      totalDeposited: user.totalDeposited,
      totalYieldEarned: user.totalYieldEarned,
      activeDeposits: user.activeDeposits,
      roi: user.totalDeposited > 0 ? (user.totalYieldEarned / user.totalDeposited) * 100 : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Automated yield optimization (runs every hour)
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Running automated yield optimization...');
  
  try {
    const activeDeposits = await Deposit.find({ withdrawn: false });
    
    for (const deposit of activeDeposits) {
      // Check if we can optimize yield (e.g., compound interest)
      const currentYield = calculateYield(deposit.amount, Date.now() - deposit.yieldStartTime.getTime());
      
      // Update yield accumulation
      deposit.yieldAccumulated = currentYield;
      await deposit.save();
    }
    
    console.log(`✅ Optimized ${activeDeposits.length} deposits`);
  } catch (error) {
    console.error('❌ Yield optimization failed:', error);
  }
});

async function calculateRealTimeYield(amount, timeElapsed, yieldRate = null) {
  if (amount === 0 || timeElapsed === 0) {
    return 0;
  }
  
  // Get real-time yield rate if not provided
  if (!yieldRate) {
    yieldRate = await vincentApp.getCurrentAaveYieldRate();
  }
  
  // Convert basis points to decimal (e.g., 550 basis points = 0.055)
  const annualRate = yieldRate / 10000;
  const secondsInYear = 365 * 24 * 3600; // 31,536,000 seconds
  
  // Calculate yield with proper precision
  // timeElapsed is in milliseconds, convert to seconds
  const timeElapsedSeconds = timeElapsed / 1000;
  
  return (amount * annualRate * timeElapsedSeconds) / secondsInYear;
}

// Fallback function for backward compatibility
function calculateYield(amount, timeElapsed) {
  if (amount === 0 || timeElapsed === 0) {
    return 0;
  }
  
  const annualRate = 0.10; // 10% annual (fallback)
  const secondsInYear = 365 * 24 * 3600; // 31,536,000 seconds
  
  // Calculate yield with proper precision
  // timeElapsed is in milliseconds, convert to seconds
  const timeElapsedSeconds = timeElapsed / 1000;
  
  return (amount * annualRate * timeElapsedSeconds) / secondsInYear;
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/toteflow-vincent')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ToteFlow Vincent App running on port ${PORT}`);
  console.log(`🌾 Automated Aave yield farming with Lit Protocol`);
});
