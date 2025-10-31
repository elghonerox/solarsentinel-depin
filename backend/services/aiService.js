const axios = require('axios');
const logger = require('../utils/logger');

/**
 * AI Service
 * 
 * Communicates with Python AI server for predictions
 * Handles request formatting and error handling
 */

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:5000';

class AIService {
  /**
   * Get prediction from AI model
   * 
   * @param {Object} sensorData - { voltage, temperature, powerOutput }
   * @returns {Object} { prediction: "Normal"|"Failure Likely", confidence: 0-1 }
   */
  async predict(sensorData) {
    try {
      const { voltage, temperature, powerOutput } = sensorData;

      // Validate input ranges (based on our simulation parameters)
      if (voltage < 8 || voltage > 14) {
        logger.warn(`Voltage out of expected range: ${voltage}V`);
      }
      if (temperature < 15 || temperature > 50) {
        logger.warn(`Temperature out of expected range: ${temperature}°C`);
      }
      if (powerOutput < 0 || powerOutput > 300) {
        logger.warn(`Power output out of expected range: ${powerOutput}W`);
      }

      // Call AI server
      const response = await axios.post(`${AI_SERVER_URL}/predict`, {
        voltage,
        temperature,
        power_output: powerOutput
      }, {
        timeout: 5000, // 5 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = {
        prediction: response.data.prediction,
        confidence: response.data.confidence,
        modelVersion: response.data.model_version || 'v1.0',
        timestamp: new Date().toISOString()
      };

      logger.info('AI prediction successful', {
        prediction: result.prediction,
        confidence: result.confidence.toFixed(3)
      });

      return result;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logger.error('AI server not reachable. Is it running on port 5000?');
        throw new Error('AI server not running. Start with: cd ai-server && python server.py');
      }

      logger.error('AI prediction failed:', error.message);
      throw new Error(`AI prediction failed: ${error.message}`);
    }
  }
  
  /**
   * Check if AI server is healthy
   * 
   * @returns {boolean} true if AI server is responsive
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${AI_SERVER_URL}/health`, {
        timeout: 2000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

const aiService = new AIService();

module.exports = aiService;