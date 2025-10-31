const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Import routes
const sensorRoutes = require('./routes/sensors');
const hederaRoutes = require('./routes/hedera');

/**
 * SolarSentinel Backend API Server
 * 
 * Coordinates between:
 * - Frontend (dashboard)
 * - AI Server (predictions)
 * - Hedera Network (blockchain logging)
 * - Simulator (sensor data generation)
 * 
 * This is the central orchestration layer for the entire system.
 */

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
    ip: req.ip
  });
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const axios = require('axios');
    
    // Check AI server
    let aiStatus = 'unknown';
    try {
      await axios.get(`${process.env.AI_SERVER_URL}/health`, { timeout: 2000 });
      aiStatus = 'ok';
    } catch (error) {
      aiStatus = 'error';
    }

    // Check simulator
    let simulatorStatus = 'unknown';
    try {
      await axios.get(`${process.env.SIMULATOR_URL}/health`, { timeout: 2000 });
      simulatorStatus = 'ok';
    } catch (error) {
      simulatorStatus = 'error';
    }

    // Check Hedera (basic check - if we have credentials)
    let hederaStatus = 'unknown';
    if (process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY) {
      hederaStatus = 'ok';
    } else {
      hederaStatus = 'error - missing credentials';
    }

    res.json({
      backend: 'ok',
      ai: aiStatus,
      simulator: simulatorStatus,
      hedera: hederaStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      backend: 'error',
      ai: 'unknown',
      simulator: 'unknown',
      hedera: 'unknown',
      error: error.message
    });
  }
});

// Routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/hedera', hederaRoutes);
app.use('/api/ai', require('./routes/sensors')); // AI predictions handled in sensors route

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 SolarSentinel Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`AI Server: ${process.env.AI_SERVER_URL}`);
  logger.info(`Simulator: ${process.env.SIMULATOR_URL}`);
  logger.info(`Hedera Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);
  
  // Warn if missing Hedera credentials
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    logger.warn('⚠️  Hedera credentials not configured. Set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in .env');
    logger.warn('⚠️  Get free testnet credentials at: https://portal.hedera.com');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});