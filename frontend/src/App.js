import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import api from './services/api';

/**
 * Main Application Component
 * 
 * Manages the overall state and coordinates between:
 * - Sensor data simulation
 * - AI predictions
 * - Hedera blockchain logging
 * - Dashboard display
 * 
 * Note: This is a PROTOTYPE. All data is simulated, not from real hardware.
 */
function App() {
  const [systemStatus, setSystemStatus] = useState({
    backend: 'checking',
    ai: 'checking',
    hedera: 'checking',
    simulator: 'checking'
  });

  const [sensorData, setSensorData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [hederaInfo, setHederaInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check system health on mount
  useEffect(() => {
    checkSystemHealth();
  }, []);

  /**
   * Verify all services are running
   * This helps users troubleshoot if something isn't working
   */
  const checkSystemHealth = async () => {
    try {
      const health = await api.checkHealth();
      setSystemStatus(health);
    } catch (error) {
      console.error('Health check failed:', error);
      setSystemStatus({
        backend: 'error',
        ai: 'unknown',
        hedera: 'unknown',
        simulator: 'unknown'
      });
    }
  };

  /**
   * Generate a simulated sensor reading and process it through the entire pipeline:
   * 1. Generate realistic sensor data (voltage, temperature, power)
   * 2. Send to AI model for anomaly detection
   * 3. Log prediction to Hedera Consensus Service
   * 4. Mint tokens if status is Normal
   * 5. Update dashboard display
   */
  const generateReading = async () => {
    setIsGenerating(true);
    
    try {
      // Step 1: Generate simulated sensor reading
      const sensor = await api.generateSensorReading();
      setSensorData(sensor);

      // Step 2: Get AI prediction
      const aiPrediction = await api.getPrediction(sensor);
      setPrediction(aiPrediction);

      // Step 3: Log to Hedera and handle tokens
      const hederaResult = await api.logToHedera({
        ...sensor,
        prediction: aiPrediction.prediction,
        confidence: aiPrediction.confidence
      });
      setHederaInfo(hederaResult);

      // Step 4: Add to history for visualization
      const newEntry = {
        timestamp: new Date().toISOString(),
        ...sensor,
        ...aiPrediction,
        hederaTxId: hederaResult.transactionId,
        tokensEarned: hederaResult.tokensEarned || 0
      };
      console.log('New Entry:', newEntry);
      console.log('Sensor:', sensor);
      console.log('AI Prediction:', aiPrediction);

setHistory(prev => [newEntry, ...prev].slice(0, 50));
      
      setHistory(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50 readings

    } catch (error) {
      console.error('Error generating reading:', error);
      alert('Error processing reading. Check console and ensure all services are running.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Auto-generate readings every 30 seconds (simulating real sensor behavior)
   * In production, this would be replaced by actual sensor data streams
   */
  const startAutoGeneration = () => {
    const interval = setInterval(generateReading, 30000); // 30 seconds
    return () => clearInterval(interval);
  };

  return (
    <div className="App">
      {/* Prototype Warning Banner - Critical for honest positioning */}
      <div className="prototype-warning">
        ⚠️ PROTOTYPE: This is a demonstration system using simulated sensor data, not real hardware deployments.
        {' '}
        <a 
          href="https://github.com/yourusername/solarsentinel-depin/blob/main/docs/LIMITATIONS.md" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'white', textDecoration: 'underline' }}
        >
          Read Limitations
        </a>
      </div>

      <div className="container">
        <header className="header">
          <h1>⚡ SolarSentinel DePIN</h1>
          <p>AI-Powered Predictive Solar Monitoring | Proof-of-Concept</p>
        </header>

        <Dashboard
          systemStatus={systemStatus}
          sensorData={sensorData}
          prediction={prediction}
          hederaInfo={hederaInfo}
          history={history}
          isGenerating={isGenerating}
          onGenerateReading={generateReading}
          onStartAuto={startAutoGeneration}
        />
      </div>
    </div>
  );
}

export default App;