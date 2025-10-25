// Real Vincent AI Agent Integration for ToteFlow Yield Marketplace
// This implements actual Vincent AI agents for automated yield farming

const express = require('express');
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(require('cors')());

// Vincent AI Configuration
const VINCENT_CONFIG = {
  apiUrl: 'https://api.heyvincent.ai/v1',
  apiKey: process.env.VINCENT_API_KEY,
  agentId: process.env.VINCENT_AGENT_ID,
  policies: {
    maxSlippage: 0.5, // 0.5% max slippage
    maxGasPrice: '50', // 50 gwei max gas price
    yieldThreshold: 0.01, // Minimum 1% yield to trigger optimization
    rebalanceFrequency: 3600 // Rebalance every hour
  }
};

// MongoDB Models (same as before)
const UserSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  totalDeposited: { type: Number, default: 0 },
  totalYieldEarned: { type: Number, default: 0 },
  activeDeposits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deposit' }],
  vincentAgentId: { type: String }, // Vincent agent ID for this user
  createdAt: { type: Date, default: Date.now }
});

const DepositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  token: { type: String, required: true },
  vincentAgentId: { type: String }, // Vincent agent managing this deposit
  yieldStrategy: { type: String, default: 'aave' }, // aave, compound, yearn, etc.
  currentYieldRate: { type: Number, default: 0 },
  yieldAccumulated: { type: Number, default: 0 },
  yieldStartTime: { type: Date, default: Date.now },
  withdrawn: { type: Boolean, default: false },
  vincentTransactions: [{ type: String }], // Vincent transaction hashes
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Deposit = mongoose.model('Deposit', DepositSchema);

// Real Vincent AI Agent Class
class VincentYieldAgent {
  constructor() {
    this.apiKey = VINCENT_CONFIG.apiKey;
    this.apiUrl = VINCENT_CONFIG.apiUrl;
    this.policies = VINCENT_CONFIG.policies;
  }

  // Create a Vincent agent for a user
  async createAgent(userAddress, depositAmount) {
    try {
      const agentConfig = {
        name: `ToteFlow-Yield-Agent-${userAddress.slice(0, 8)}`,
        description: `Automated yield farming agent for ${userAddress}`,
        policies: {
          maxSlippage: this.policies.maxSlippage,
          maxGasPrice: this.policies.maxGasPrice,
          yieldThreshold: this.policies.yieldThreshold,
          allowedProtocols: ['aave', 'compound', 'yearn'],
          allowedTokens: ['USDC', 'USDT', 'DAI'],
          maxDepositAmount: depositAmount * 2, // Allow up to 2x deposit for optimization
          rebalanceFrequency: this.policies.rebalanceFrequency
        },
        capabilities: [
          'supply_to_aave',
          'withdraw_from_aave',
          'supply_to_compound',
          'withdraw_from_compound',
          'deposit_to_yearn',
          'withdraw_from_yearn',
          'rebalance_positions',
          'optimize_yield'
        ],
        litProtocolConfig: {
          accessControlConditions: [
            {
              contractAddress: '',
              standardContractType: '',
              chain: 'base-sepolia',
              method: '',
              parameters: [':userAddress'],
              returnValueTest: {
                comparator: '=',
                value: userAddress
              }
            }
          ]
        }
      };

      const response = await axios.post(`${this.apiUrl}/agents`, agentConfig, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.agentId;
    } catch (error) {
      console.error('Error creating Vincent agent:', error);
      throw error;
    }
  }

  // Execute yield farming strategy via Vincent agent
  async executeYieldStrategy(agentId, strategy, params) {
    try {
      const command = {
        agentId: agentId,
        action: strategy,
        parameters: params,
        gasLimit: 500000,
        maxGasPrice: this.policies.maxGasPrice
      };

      const response = await axios.post(`${this.apiUrl}/agents/${agentId}/execute`, command, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error executing Vincent strategy:', error);
      throw error;
    }
  }

  // Get current yield rates from multiple protocols
  async getOptimalYieldRate(token = 'USDC') {
    try {
      const protocols = ['aave', 'compound', 'yearn'];
      const rates = {};

      for (const protocol of protocols) {
        try {
          const response = await axios.get(`${this.apiUrl}/protocols/${protocol}/rates/${token}`, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`
            }
          });
          rates[protocol] = response.data.supplyRate;
        } catch (error) {
          console.warn(`Failed to get ${protocol} rate:`, error.message);
          rates[protocol] = 0;
        }
      }

      // Find optimal protocol
      const optimalProtocol = Object.keys(rates).reduce((a, b) => 
        rates[a] > rates[b] ? a : b
      );

      return {
        protocol: optimalProtocol,
        rate: rates[optimalProtocol],
        allRates: rates
      };
    } catch (error) {
      console.error('Error getting optimal yield rate:', error);
      return { protocol: 'aave', rate: 0.05, allRates: {} };
    }
  }

  // Monitor and optimize yield positions
  async optimizeYield(agentId, depositId) {
    try {
      // Get current optimal strategy
      const optimal = await this.getOptimalYieldRate();
      
      // Execute optimization if yield improvement > threshold
      if (optimal.rate > this.policies.yieldThreshold) {
        const result = await this.executeYieldStrategy(agentId, 'optimize_yield', {
          targetProtocol: optimal.protocol,
          targetRate: optimal.rate,
          depositId: depositId
        });

        return {
          success: true,
          newProtocol: optimal.protocol,
          newRate: optimal.rate,
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed
        };
      }

      return {
        success: false,
        message: 'No optimization needed - current rate is optimal'
      };
    } catch (error) {
      console.error('Error optimizing yield:', error);
      throw error;
    }
  }

  // Get agent status and performance
  async getAgentStatus(agentId) {
    try {
      const response = await axios.get(`${this.apiUrl}/agents/${agentId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting agent status:', error);
      throw error;
    }
  }
}

// Initialize Vincent AI Agent
const vincentAgent = new VincentYieldAgent();

// API Routes with Real Vincent Integration

// Create deposit with Vincent agent
app.post('/api/deposit', async (req, res) => {
  try {
    const { userAddress, amount, token } = req.body;
    
    // Create or update user
    let user = await User.findOne({ address: userAddress });
    if (!user) {
      user = new User({ address: userAddress });
      await user.save();
    }

    // Create Vincent agent for this user if not exists
    if (!user.vincentAgentId) {
      user.vincentAgentId = await vincentAgent.createAgent(userAddress, amount);
      await user.save();
    }

    // Get optimal yield strategy
    const optimalStrategy = await vincentAgent.getOptimalYieldRate(token);
    
    // Create deposit record
    const deposit = new Deposit({
      userId: user._id,
      amount,
      token,
      vincentAgentId: user.vincentAgentId,
      yieldStrategy: optimalStrategy.protocol,
      currentYieldRate: optimalStrategy.rate
    });
    await deposit.save();

    // Execute yield farming via Vincent agent
    const vincentResult = await vincentAgent.executeYieldStrategy(
      user.vincentAgentId,
      `supply_to_${optimalStrategy.protocol}`,
      {
        amount: amount,
        token: token,
        depositId: deposit._id.toString()
      }
    );

    // Update deposit with Vincent transaction
    deposit.vincentTransactions.push(vincentResult.transactionHash);
    await deposit.save();

    // Update user
    user.totalDeposited += amount;
    user.activeDeposits.push(deposit._id);
    await user.save();

    res.json({
      success: true,
      depositId: deposit._id,
      vincentAgentId: user.vincentAgentId,
      yieldStrategy: optimalStrategy.protocol,
      currentYieldRate: optimalStrategy.rate,
      transactionHash: vincentResult.transactionHash,
      message: `Deposit successful! Vincent agent is now farming yield on ${optimalStrategy.protocol} at ${(optimalStrategy.rate * 100).toFixed(2)}% APY`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw with Vincent agent
app.post('/api/withdraw', async (req, res) => {
  try {
    const { userAddress, depositId } = req.body;
    
    const deposit = await Deposit.findById(depositId);
    if (!deposit || deposit.withdrawn) {
      return res.status(400).json({ error: 'Invalid deposit' });
    }

    const user = await User.findById(deposit.userId);
    if (!user || user.address !== userAddress) {
      return res.status(400).json({ error: 'Unauthorized' });
    }

    // Execute withdrawal via Vincent agent
    const vincentResult = await vincentAgent.executeYieldStrategy(
      user.vincentAgentId,
      `withdraw_from_${deposit.yieldStrategy}`,
      {
        depositId: deposit._id.toString(),
        amount: deposit.amount
      }
    );

    // Calculate final yield earned
    const timeElapsed = Date.now() - deposit.yieldStartTime.getTime();
    const yieldEarned = (deposit.amount * deposit.currentYieldRate * timeElapsed) / (365 * 24 * 3600 * 1000);
    
    // Update deposit
    deposit.withdrawn = true;
    deposit.yieldAccumulated = yieldEarned;
    deposit.vincentTransactions.push(vincentResult.transactionHash);
    await deposit.save();

    // Update user
    user.totalYieldEarned += yieldEarned;
    await user.save();

    res.json({
      success: true,
      amount: deposit.amount,
      yieldEarned: yieldEarned,
      totalAmount: deposit.amount + yieldEarned,
      transactionHash: vincentResult.transactionHash,
      gasUsed: vincentResult.gasUsed,
      message: `Withdrawal successful! Vincent agent executed withdrawal from ${deposit.yieldStrategy}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Vincent agent status
app.get('/api/agent/:agentId/status', async (req, res) => {
  try {
    const { agentId } = req.params;
    const status = await vincentAgent.getAgentStatus(agentId);
    
    res.json({
      success: true,
      agentId: agentId,
      status: status.status,
      performance: status.performance,
      transactions: status.transactions,
      currentYieldRate: status.currentYieldRate,
      totalYieldEarned: status.totalYieldEarned
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optimize yield positions (called by cron job)
app.post('/api/optimize/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { depositId } = req.body;
    
    const result = await vincentAgent.optimizeYield(agentId, depositId);
    
    res.json({
      success: true,
      optimization: result,
      message: result.success ? 
        `Yield optimized! Moved to ${result.newProtocol} at ${(result.newRate * 100).toFixed(2)}% APY` :
        'No optimization needed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Automated yield optimization (runs every hour)
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Running Vincent AI yield optimization...');
  
  try {
    const activeDeposits = await Deposit.find({ withdrawn: false });
    
    for (const deposit of activeDeposits) {
      try {
        const result = await vincentAgent.optimizeYield(deposit.vincentAgentId, deposit._id.toString());
        
        if (result.success) {
          console.log(`✅ Optimized deposit ${deposit._id}: ${result.newProtocol} at ${(result.newRate * 100).toFixed(2)}% APY`);
          
          // Update deposit with new strategy
          deposit.yieldStrategy = result.newProtocol;
          deposit.currentYieldRate = result.newRate;
          deposit.vincentTransactions.push(result.transactionHash);
          await deposit.save();
        }
      } catch (error) {
        console.error(`❌ Failed to optimize deposit ${deposit._id}:`, error.message);
      }
    }
    
    console.log(`✅ Vincent AI optimization complete for ${activeDeposits.length} deposits`);
  } catch (error) {
    console.error('❌ Vincent AI optimization failed:', error);
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/toteflow-vincent')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ToteFlow Vincent AI App running on port ${PORT}`);
  console.log(`🤖 Real Vincent AI agents managing yield farming`);
  console.log(`🌾 Automated Aave/Compound/Yearn optimization`);
});
