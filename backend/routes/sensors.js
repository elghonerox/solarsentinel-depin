const express = require('express');
const axios = require('axios');
const logger = require('../utils/logger');
const aiService = require('../services/aiService');

const router = express.Router();

// Default URLs with fallbacks
const SIMULATOR_URL = process.env.SIMULATOR_URL || 'http://localhost:4000';
const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:5000';

/**
 * Sensor Routes
 * 
 * Handles sensor data generation and AI predictions
 * Coordinates between simulator and AI server
 */

/**
 * GET /api/sensors/generate
 * Generate a simulated sensor reading
 * 
 * Returns: { voltage, temperature, powerOutput, deviceId, timestamp }
 */
router.get('/generate', async (req, res) => {
  try {
    logger.info(`Calling simulator at: ${SIMULATOR_URL}/api/generate`);
    
    const response = await axios.get(`${SIMULATOR_URL}/api/generate`, {
      timeout: 5000
    });
    const sensorData = response.data;
    
    logger.info('Generated sensor reading', { deviceId: sensorData.deviceId });
    
    res.json(sensorData);
  } catch (error) {
    logger.error('Failed to generate sensor reading:', error.message);
    logger.error('Simulator URL:', SIMULATOR_URL);
    
    res.status(500).json({ 
      error: 'Failed to generate sensor reading',
      message: 'Ensure simulator is running on port 4000',
      details: error.message,
      simulatorUrl: SIMULATOR_URL
    });
  }
});

/**
 * POST /api/ai/predict
 * Get AI prediction for sensor data
 * 
 * Body: { voltage, temperature, powerOutput }
 * Returns: { prediction: "Normal"|"Failure Likely", confidence: 0-1 }
 */
router.post('/predict', async (req, res) => {
  try {
    const { voltage, temperature, powerOutput } = req.body;

    // Validate input
    if (!voltage || !temperature || !powerOutput) {
      return res.status(400).json({ 
        error: 'Missing required fields: voltage, temperature, powerOutput' 
      });
    }

    logger.info(`Calling AI server at: ${AI_SERVER_URL}/predict`);

    // Call AI service
    const prediction = await aiService.predict({ voltage, temperature, powerOutput });
    
    logger.info('AI prediction made', { 
      prediction: prediction.prediction,
      confidence: prediction.confidence 
    });
    
    res.json(prediction);
  } catch (error) {
    logger.error('AI prediction failed:', error.message);
    logger.error('AI Server URL:', AI_SERVER_URL);
    
    res.status(500).json({ 
      error: 'AI prediction failed',
      message: 'Ensure AI server is running on port 5000',
      details: error.message,
      aiServerUrl: AI_SERVER_URL
    });
  }
});

/**
 * GET /api/sensors/history
 * Get historical sensor readings (if we implement persistence)
 * 
 * Note: Currently returns empty array as we don't persist data
 * In production, this would query a database
 */
router.get('/history', (req, res) => {
  // TODO: Implement database persistence
  res.json({ 
    message: 'History not yet implemented - data currently in-memory only',
    history: []
  });
});

module.exports = router;