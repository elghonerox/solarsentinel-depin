import React from 'react';
import SensorCard from './SensorCard';
import PredictionChart from './PredictionChart';
import HederaTransactions from './HederaTransactions';
import TokenBalance from './TokenBalance';

/**
 * Main Dashboard Component
 * 
 * Orchestrates all dashboard widgets:
 * - System health status
 * - Latest sensor readings
 * - AI predictions
 * - Hedera blockchain info
 * - Historical chart
 * - Token balance
 * 
 * Props:
 * - systemStatus: health check results for all services
 * - sensorData: latest sensor reading
 * - prediction: AI model output
 * - hederaInfo: blockchain transaction details
 * - history: array of past readings for charting
 * - isGenerating: boolean for loading state
 * - onGenerateReading: callback to trigger new reading
 * - onStartAuto: callback to enable auto-generation
 */
const Dashboard = ({
  systemStatus,
  sensorData,
  prediction,
  hederaInfo,
  history,
  isGenerating,
  onGenerateReading,
  onStartAuto
}) => {
  
  // Render system health indicators
  const renderSystemStatus = () => {
    const statusEmoji = {
      'ok': '✅',
      'checking': '⏳',
      'error': '❌',
      'unknown': '❓'
    };

    return (
      <div className="card">
        <h2>System Health</h2>
        <div className="metric">
          <span className="metric-label">Backend API:</span>
          <span className="metric-value">
            {statusEmoji[systemStatus.backend]} {systemStatus.backend}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">AI Server:</span>
          <span className="metric-value">
            {statusEmoji[systemStatus.ai]} {systemStatus.ai}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Hedera Testnet:</span>
          <span className="metric-value">
            {statusEmoji[systemStatus.hedera]} {systemStatus.hedera}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Simulator:</span>
          <span className="metric-value">
            {statusEmoji[systemStatus.simulator]} {systemStatus.simulator}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Control Panel */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2>Control Panel</h2>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Generate simulated sensor readings and see the entire AI → Blockchain pipeline in action
        </p>
        <button 
          className="button" 
          onClick={onGenerateReading}
          disabled={isGenerating}
          style={{ marginRight: '10px' }}
        >
          {isGenerating ? 'Processing...' : '⚡ Generate Reading'}
        </button>
        <button 
          className="button" 
          onClick={onStartAuto}
          style={{ background: '#764ba2' }}
        >
          🔄 Start Auto (30s interval)
        </button>
      </div>

      {/* System Status */}
      <div className="grid">
        {renderSystemStatus()}
        
        {/* Token Balance */}
        <TokenBalance hederaInfo={hederaInfo} />
      </div>

      {/* Latest Sensor Reading */}
      {sensorData && (
        <div className="grid">
          <SensorCard sensorData={sensorData} prediction={prediction} />
        </div>
      )}

      {/* Historical Chart */}
      {history.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <PredictionChart history={history} />
        </div>
      )}

      {/* Hedera Transactions */}
      {hederaInfo && (
        <div className="card" style={{ marginTop: '20px' }}>
          <HederaTransactions hederaInfo={hederaInfo} />
        </div>
      )}

      {/* Information Footer */}
      <div className="card" style={{ marginTop: '20px', background: '#f5f5f5' }}>
        <h2>About This Prototype</h2>
        <p style={{ marginBottom: '10px' }}>
          <strong>What's Real:</strong> Complete working system with AI prediction, Hedera blockchain logging, and token minting.
        </p>
        <p style={{ marginBottom: '10px' }}>
          <strong>What's Simulated:</strong> Sensor data is generated based on documented African solar conditions, not from physical hardware.
        </p>
        <p>
          <strong>Next Steps:</strong> Field validation with real IoT sensors to test if AI accuracy holds in production.
        </p>
        <div style={{ marginTop: '15px' }}>
          <a href="https://github.com/elghonerox/solarsentinel-depin" target="_blank" rel="noopener noreferrer" style={{ marginRight: '15px' }}>
            📖 Documentation
          </a>
          <a href="https://github.com/elghonerox/solarsentinel-depin/blob/main/docs/LIMITATIONS.md" target="_blank" rel="noopener noreferrer">
            🚧 Known Limitations
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
