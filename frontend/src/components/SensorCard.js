import React from 'react';

/**
 * Sensor Card Component
 * 
 * Displays latest sensor reading with AI prediction
 * Color-coded based on prediction result
 * 
 * Props:
 * - sensorData: { voltage, temperature, powerOutput, deviceId, timestamp }
 * - prediction: { prediction, confidence }
 */
const SensorCard = ({ sensorData, prediction }) => {
  if (!sensorData) return null;

  // Determine status styling based on prediction
  const getStatusClass = () => {
    if (!prediction) return 'status-badge';
    return prediction.prediction === 'Normal' ? 'status-badge status-normal' : 'status-badge status-failure';
  };

  const getStatusText = () => {
    if (!prediction) return 'Analyzing...';
    return prediction.prediction;
  };

  // Format confidence as percentage
  const formatConfidence = (conf) => {
    return conf ? `${(conf * 100).toFixed(1)}%` : 'N/A';
  };

  // Determine sensor status colors
  const getVoltageColor = (voltage) => {
    if (voltage < 11) return '#f44336'; // Critical - red
    if (voltage < 11.5) return '#ff9800'; // Warning - orange
    return '#4caf50'; // Normal - green
  };

  const getTemperatureColor = (temp) => {
    if (temp > 40) return '#f44336'; // Critical - red
    if (temp > 35) return '#ff9800'; // Warning - orange
    return '#2196f3'; // Normal - blue
  };

  const getPowerColor = (power) => {
    if (power < 100) return '#f44336'; // Critical - red
    if (power < 150) return '#ff9800'; // Warning - orange
    return '#4caf50'; // Normal - green
  };

  return (
    <div className="card">
      <h2>📊 Latest Sensor Reading</h2>
      
      {/* Device Info */}
      <div className="metric">
        <span className="metric-label">Device ID:</span>
        <span className="metric-value" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
          {sensorData.deviceId}
        </span>
      </div>
      
      <div className="metric">
        <span className="metric-label">Timestamp:</span>
        <span className="metric-value" style={{ fontSize: '0.9rem' }}>
          {new Date(sensorData.timestamp).toLocaleString()}
        </span>
      </div>

      {/* Sensor Metrics */}
      <div style={{ margin: '20px 0', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
        <div className="metric">
          <span className="metric-label">⚡ Voltage:</span>
          <span 
            className="metric-value" 
            style={{ 
              fontSize: '1.3rem', 
              color: getVoltageColor(sensorData.voltage),
              fontWeight: 'bold'
            }}
          >
            {sensorData.voltage.toFixed(2)} V
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">🌡️ Temperature:</span>
          <span 
            className="metric-value" 
            style={{ 
              fontSize: '1.3rem', 
              color: getTemperatureColor(sensorData.temperature),
              fontWeight: 'bold'
            }}
          >
            {sensorData.temperature.toFixed(1)} °C
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">⚙️ Power Output:</span>
          <span 
            className="metric-value" 
            style={{ 
              fontSize: '1.3rem', 
              color: getPowerColor(sensorData.powerOutput),
              fontWeight: 'bold'
            }}
          >
            {sensorData.powerOutput.toFixed(1)} W
          </span>
        </div>
      </div>

      {/* AI Prediction */}
      {prediction && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>🤖 AI Prediction</h3>
          <div className={getStatusClass()}>
            {getStatusText()}
          </div>
          <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9rem' }}>
            Confidence: <strong>{formatConfidence(prediction.confidence)}</strong>
          </p>
          {prediction.prediction === 'Failure Likely' && (
            <div style={{ marginTop: '10px', padding: '10px', background: '#ffebee', borderRadius: '6px' }}>
              <p style={{ color: '#f44336', fontSize: '0.9rem', margin: 0 }}>
                ⚠️ <strong>Predictive Alert:</strong> Maintenance recommended within 48 hours
              </p>
              <p style={{ color: '#f44336', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                Low voltage and power output detected. Possible causes: dust accumulation, connection issues, or panel degradation.
              </p>
            </div>
          )}
          {prediction.prediction === 'Normal' && (
            <div style={{ marginTop: '10px', padding: '10px', background: '#e8f5e9', borderRadius: '6px' }}>
              <p style={{ color: '#4caf50', fontSize: '0.9rem', margin: 0 }}>
                ✅ <strong>Optimal Performance:</strong> All parameters within normal ranges
              </p>
            </div>
          )}
        </div>
      )}

      {/* Simulation Notice */}
      <div style={{ marginTop: '20px', padding: '10px', background: '#fff3cd', borderRadius: '6px', fontSize: '0.85rem', color: '#856404' }}>
        ℹ️ <strong>Note:</strong> This is simulated sensor data based on documented African solar panel conditions. 
        Real hardware integration is the next validation step.
      </div>
    </div>
  );
};

export default SensorCard;