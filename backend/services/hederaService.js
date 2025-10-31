const {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicInfoQuery,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TransferTransaction,
  AccountBalanceQuery,
  PrivateKey,
  Hbar
} = require('@hashgraph/sdk');
const logger = require('../utils/logger');

/**
 * Hedera Service
 * 
 * Handles all interactions with Hedera network:
 * - HCS: Consensus Service for immutable logging
 * - HTS: Token Service for EnergyToken (ETK) rewards
 * 
 * IMPORTANT: This uses TESTNET credentials (free, no real value)
 * Mainnet deployment requires economic model validation first
 */

class HederaService {
  constructor() {
    this.client = null;
    this.topicId = null;
    this.tokenId = null;
    this.accountId = null;
    this.initialize();
  }

  /**
   * Initialize Hedera client and verify credentials
   */
  async initialize() {
    try {
      // Validate environment variables
      if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        throw new Error('Hedera credentials not configured. Set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in .env');
      }

      this.accountId = process.env.HEDERA_ACCOUNT_ID;
      const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

      // Create client for testnet
      if (process.env.HEDERA_NETWORK === 'mainnet') {
        this.client = Client.forMainnet();
        logger.warn('⚠️  Using MAINNET - transactions cost real money!');
      } else {
        this.client = Client.forTestnet();
        logger.info('✅ Using TESTNET - transactions are free');
      }

      this.client.setOperator(this.accountId, privateKey);

      // Set reasonable timeout
      this.client.setRequestTimeout(30000); // 30 seconds

      // Load or create HCS topic
      if (process.env.HCS_TOPIC_ID) {
        this.topicId = process.env.HCS_TOPIC_ID;
        logger.info(`Using existing HCS topic: ${this.topicId}`);
      } else {
        await this.createTopic();
      }

      // Load or create HTS token
      if (process.env.HTS_TOKEN_ID) {
        this.tokenId = process.env.HTS_TOKEN_ID;
        logger.info(`Using existing HTS token: ${this.tokenId}`);
      } else {
        logger.warn('HTS_TOKEN_ID not set. Token minting will be simulated.');
        logger.warn('To create a real token, see: docs/HEDERA_INTEGRATION.md');
      }

      logger.info('✅ Hedera service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Hedera service:', error.message);
      throw error;
    }
  }

  /**
   * Create a new HCS topic for logging sensor data
   * Only called if HCS_TOPIC_ID is not set in .env
   */
  async createTopic() {
    try {
      logger.info('Creating new HCS topic...');

      const transaction = new TopicCreateTransaction()
        .setTopicMemo('SolarSentinel DePIN - Sensor Data Log')
        .setAdminKey(this.client.operatorPublicKey);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      this.topicId = receipt.topicId.toString();

      logger.info(`✅ Created HCS topic: ${this.topicId}`);
      logger.warn(`⚠️  Add this to your .env file: HCS_TOPIC_ID=${this.topicId}`);

      return this.topicId;
    } catch (error) {
      logger.error('Failed to create HCS topic:', error.message);
      throw error;
    }
  }

  /**
   * Submit a message to HCS topic
   * Logs sensor reading + AI prediction immutably
   * 
   * @param {Object} data - Sensor data with prediction
   * @returns {Object} { transactionId, topicId, sequenceNumber }
   */
  async submitMessage(data) {
    try {
      if (!this.topicId) {
        throw new Error('HCS topic not initialized');
      }

      // Prepare message (JSON format)
      const message = {
        deviceId: data.deviceId,
        timestamp: data.timestamp || new Date().toISOString(),
        voltage: data.voltage,
        temperature: data.temperature,
        powerOutput: data.powerOutput,
        aiPrediction: data.prediction,
        confidenceScore: data.confidence,
        modelVersion: 'v1.0-isolation-forest'
      };

      const messageString = JSON.stringify(message);

      // Submit to HCS
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(messageString);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      const result = {
        transactionId: txResponse.transactionId.toString(),
        topicId: this.topicId,
        sequenceNumber: receipt.topicSequenceNumber.toString(),
        timestamp: new Date().toISOString()
      };

      logger.info('Message submitted to HCS', {
        transactionId: result.transactionId,
        prediction: data.prediction
      });

      return result;
    } catch (error) {
      logger.error('Failed to submit HCS message:', error.message);
      throw error;
    }
  }

  /**
   * Mint EnergyTokens (ETK) as reward
   * 
   * Note: This is SIMULATED if no real token exists
   * To create a real token, see docs/HEDERA_INTEGRATION.md
   * 
   * @param {number} amount - Amount of ETK to mint
   * @returns {Object} { tokenId, amount, transactionId }
   */
  async mintTokens(amount) {
    try {
      if (!this.tokenId) {
        // Simulate token minting for prototype
        logger.info(`Simulated minting ${amount} ETK (no real token configured)`);
        return {
          tokenId: '0.0.SIMULATED',
          amount,
          transactionId: 'SIMULATED_' + Date.now(),
          simulated: true
        };
      }

      // Real token transfer logic (when token exists)
      // Note: For testnet demo, we just log the intent
      logger.info(`Would mint ${amount} ETK to account ${this.accountId}`);
      
      // In production, this would be:
      // const transaction = new TransferTransaction()
      //   .addTokenTransfer(this.tokenId, treasuryId, -amount)
      //   .addTokenTransfer(this.tokenId, this.accountId, amount);
      // const txResponse = await transaction.execute(this.client);

      return {
        tokenId: this.tokenId,
        amount,
        transactionId: 'TESTNET_SIMULATION',
        simulated: true
      };
    } catch (error) {
      logger.error('Failed to mint tokens:', error.message);
      throw error;
    }
  }

  /**
   * Get current token balance
   * 
   * @returns {number} Token balance
   */
  async getTokenBalance() {
    try {
      if (!this.tokenId) {
        return 0; // No token configured
      }

      const query = new AccountBalanceQuery()
        .setAccountId(this.accountId);

      const balance = await query.execute(this.client);
      
      // Get token balance if it exists
      const tokenBalance = balance.tokens?._map.get(this.tokenId) || 0;

      return parseFloat(tokenBalance);
    } catch (error) {
      logger.error('Failed to get token balance:', error.message);
      return 0;
    }
  }

  /**
   * Get recent messages from HCS topic
   * 
   * Note: This requires Mirror Node API integration (not implemented in prototype)
   * For now, returns empty array with explanation
   * 
   * @param {number} limit - Number of messages to retrieve
   * @returns {Array} Recent messages
   */
  async getRecentMessages(limit = 10) {
    try {
      // TODO: Implement Mirror Node API integration
      // Mirror Node endpoint: https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages
      
      logger.info(`Mirror Node integration not yet implemented. Would fetch ${limit} messages from topic ${this.topicId}`);
      
      return [];
    } catch (error) {
      logger.error('Failed to get recent messages:', error.message);
      return [];
    }
  }

  /**
   * Get HCS topic information
   * 
   * @returns {Object} Topic metadata
   */
  async getTopicInfo() {
    try {
      if (!this.topicId) {
        throw new Error('HCS topic not initialized');
      }

      const query = new TopicInfoQuery()
        .setTopicId(this.topicId);

      const info = await query.execute(this.client);

      return {
        topicId: this.topicId,
        memo: info.topicMemo,
        sequenceNumber: info.sequenceNumber.toString(),
        adminKey: info.adminKey?.toString() || 'None'
      };
    } catch (error) {
      logger.error('Failed to get topic info:', error.message);
      throw error;
    }
  }
}

// Singleton instance
const hederaService = new HederaService();

module.exports = hederaService;