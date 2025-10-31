import axios from 'axios';

/**
 * API Service for communicating with backend
 * 
 * All backend communication is centralized here for:
 * - Easier debugging
 * - Consistent error handling
 * - Clear documentation of available endpoints
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = {
  /**
   * Check if all backend services are healthy
   * Returns status of: backend, AI server, Hedera, simulator
   */
  checkHealth: async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/health`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  /**
   * Generate a simulated sensor reading
   * Returns: { voltage, temperature, powerOutput, deviceId, timestamp }
   */
  generateSensorReading: async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/sensors/generate`);
      return response.data;
    } catch (error) {
      console.error('Failed to generate sensor reading:', error);
      throw error;
    }
  },

  /**
   * Get AI prediction for sensor data
   * Sends sensor readings to AI model for anomaly detection
   * Returns: { prediction: "Normal"|"Failure Likely", confidence: 0-1 }
   */
  getPrediction: async (sensorData) => {
    try {
      const response = await axios.post(`${API_BASE}/api/ai/predict`, {
        voltage: sensorData.voltage,
        temperature: sensorData.temperature,
        powerOutput: sensorData.powerOutput
      });
      return response.data;
    } catch (error) {
      console.error('AI prediction failed:', error);
      throw error;
    }
  },

  /**
   * Log sensor reading + prediction to Hedera Consensus Service
   * Also handles token minting for Normal readings
   * Returns: { transactionId, tokensEarned, hcsTopicId }
   */
  logToHedera: async (data) => {
    try {
      const response = await axios.post(`${API_BASE}/api/hedera/log`, data);
      return response.data;
    } catch (error) {
      console.error('Hedera logging failed:', error);
      throw error;
    }
  },

  /**
   * Get current token balance from Hedera Token Service
   * Returns: { balance, tokenId, accountId }
   */
  getTokenBalance: async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/hedera/balance`);
      return response.data;
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw error;
    }
  },

  /**
   * Get recent Hedera transactions
   * Returns array of recent HCS messages and HTS transfers
   */
  getRecentTransactions: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE}/api/hedera/transactions?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw error;
    }
  }
};

export default api;