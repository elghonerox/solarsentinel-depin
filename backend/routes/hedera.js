const express = require('express');
const logger = require('../utils/logger');
const hederaService = require('../services/hederaService');

const router = express.Router();

/**
 * Hedera Routes
 * 
 * Handles all Hedera blockchain interactions:
 * - HCS (Consensus Service) message submission
 * - HTS (Token Service) minting and transfers
 * - Account balance queries
 * - Transaction history
 */

/**
 * POST /api/hedera/log
 * Log sensor reading + prediction to Hedera Consensus Service
 * Mint tokens if prediction is Normal
 * 
 * Body: {
 *   deviceId, timestamp, voltage, temperature, powerOutput,
 *   prediction, confidence
 * }
 * 
 * Returns: {
 *   transactionId, topicId, tokensEarned, tokenId, accountId
 * }
 */
router.post('/log', async (req, res) => {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.deviceId || !data.prediction) {
      return res.status(400).json({ 
        error: 'Missing required fields: deviceId, prediction' 
      });
    }

    // Log to HCS
    const hcsResult = await hederaService.submitMessage(data);
    
    // Mint tokens if Normal reading
    let tokensEarned = 0;
    let tokenTransferResult = null;
    
    if (data.prediction === 'Normal') {
      tokensEarned = 1.0; // 1 ETK per Normal reading
      try {
        tokenTransferResult = await hederaService.mintTokens(tokensEarned);
        logger.info(`Minted ${tokensEarned} ETK for Normal reading`);
      } catch (tokenError) {
        logger.error('Token minting failed (non-critical):', tokenError.message);
        // Don't fail the entire request if token minting fails
      }
    }

    const response = {
      transactionId: hcsResult.transactionId,
      topicId: hcsResult.topicId,
      tokensEarned,
      tokenId: tokenTransferResult?.tokenId || process.env.HTS_TOKEN_ID,
      accountId: process.env.HEDERA_ACCOUNT_ID,
      timestamp: new Date().toISOString()
    };

    logger.info('Successfully logged to Hedera', {
      transactionId: response.transactionId,
      tokensEarned
    });

    res.json(response);
  } catch (error) {
    logger.error('Hedera logging failed:', error.message);
    res.status(500).json({ 
      error: 'Failed to log to Hedera',
      message: error.message,
      hint: 'Check that HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY are set in .env'
    });
  }
});

/**
 * GET /api/hedera/balance
 * Get current token balance
 * 
 * Returns: { balance, tokenId, accountId }
 */
router.get('/balance', async (req, res) => {
  try {
    const balance = await hederaService.getTokenBalance();
    
    res.json({
      balance,
      tokenId: process.env.HTS_TOKEN_ID,
      accountId: process.env.HEDERA_ACCOUNT_ID,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get token balance:', error.message);
    res.status(500).json({ 
      error: 'Failed to get token balance',
      message: error.message
    });
  }
});

/**
 * GET /api/hedera/transactions
 * Get recent transactions from HCS topic
 * 
 * Query params: limit (default: 10)
 * Returns: { transactions: [...] }
 */
router.get('/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const transactions = await hederaService.getRecentMessages(limit);
    
    res.json({
      transactions,
      topicId: process.env.HCS_TOPIC_ID,
      count: transactions.length
    });
  } catch (error) {
    logger.error('Failed to get transactions:', error.message);
    res.status(500).json({ 
      error: 'Failed to get transactions',
      message: error.message
    });
  }
});

/**
 * GET /api/hedera/topic
 * Get HCS topic information
 * 
 * Returns: { topicId, memo, messages }
 */
router.get('/topic', async (req, res) => {
  try {
    const topicInfo = await hederaService.getTopicInfo();
    
    res.json(topicInfo);
  } catch (error) {
    logger.error('Failed to get topic info:', error.message);
    res.status(500).json({ 
      error: 'Failed to get topic info',
      message: error.message
    });
  }
});

module.exports = router;