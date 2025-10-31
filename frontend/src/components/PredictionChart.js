import React from 'react';

/**
 * Prediction Chart Component
 * 
 * Visualizes historical sensor readings and AI predictions over time
 * Shows voltage, temperature, and power output trends
 * Color-codes predictions (green = Normal, red = Failure Likely)
 * 
 * Props:
 * - history: array of readings with sensor data + predictions
 */
const PredictionChart = ({ history }) => {
  if (!history || history.length === 0) return null;

  // Calculate statistics
  const normalCount = history.filter(r => r.prediction === 'Normal').length;
  const failureCount = history.length - normalCount;
  const avgConfidence = (history.reduce((sum, r) => sum + r.confidence, 0) / history.length * 100).toFixed(1);

  return (
    <div>
      <h2>📈 Historical Predictions</h2>
      
      {/* Statistics Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: '#4caf50', fontWeight: 'bold' }}>{normalCount}</div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Normal Readings</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: '#f44336', fontWeight: 'bold' }}>{failureCount}</div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Anomalies Detected</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: '#667eea', fontWeight: 'bold' }}>{avgConfidence}%</div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Avg Confidence</div>
        </div>
      </div>

      {/* Simple Sparkline Visualization */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Power Output Trend</h4>
        <div style={{ height: '60px', display: 'flex', alignItems: 'end', gap: '2px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
          {history.slice(-20).map((item, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: `${(item.powerOutput / 300) * 50}px`,
                backgroundColor: item.prediction === 'Normal' ? '#4caf50' : '#f44336',
                borderRadius: '2px',
                minWidth: '4px',
                transition: 'all 0.3s ease'
              }}
              title={`Time: ${new Date(item.timestamp).toLocaleTimeString()}\nPower: ${item.powerOutput.toFixed(1)}W\nPrediction: ${item.prediction}\nConfidence: ${(item.confidence * 100).toFixed(1)}%`}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
          <span>Older</span>
          <span>Newer</span>
        </div>
      </div>

      {/* Multi-line Sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div>
          <h5 style={{ marginBottom: '5px', fontSize: '0.9rem' }}>Voltage</h5>
          <div style={{ height: '40px', display: 'flex', alignItems: 'end', gap: '1px' }}>
            {history.slice(-15).map((item, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: `${((item.voltage - 8) / 6) * 35}px`,
                  backgroundColor: '#667eea',
                  borderRadius: '1px',
                  minWidth: '3px'
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <h5 style={{ marginBottom: '5px', fontSize: '0.9rem' }}>Temperature</h5>
          <div style={{ height: '40px', display: 'flex', alignItems: 'end', gap: '1px' }}>
            {history.slice(-15).map((item, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: `${((item.temperature - 15) / 35) * 35}px`,
                  backgroundColor: '#f44336',
                  borderRadius: '1px',
                  minWidth: '3px'
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <h5 style={{ marginBottom: '5px', fontSize: '0.9rem' }}>Power</h5>
          <div style={{ height: '40px', display: 'flex', alignItems: 'end', gap: '1px' }}>
            {history.slice(-15).map((item, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: `${(item.powerOutput / 300) * 35}px`,
                  backgroundColor: '#4caf50',
                  borderRadius: '1px',
                  minWidth: '3px'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <h4 style={{ marginBottom: '10px' }}>Recent Readings</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Time</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Voltage</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Temp</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Power</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Prediction</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr 
                key={index} 
                style={{ 
                  borderBottom: '1px solid #eee',
                  backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                }}
              >
                <td style={{ padding: '10px', fontFamily: 'monospace' }}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    color: item.voltage < 11 ? '#f44336' : item.voltage < 11.5 ? '#ff9800' : '#4caf50',
                    fontWeight: 'bold'
                  }}>
                    {item.voltage.toFixed(2)}V
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    color: item.temperature > 40 ? '#f44336' : item.temperature > 35 ? '#ff9800' : '#2196f3',
                    fontWeight: 'bold'
                  }}>
                    {item.temperature.toFixed(1)}°C
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    color: item.powerOutput < 100 ? '#f44336' : item.powerOutput < 150 ? '#ff9800' : '#4caf50',
                    fontWeight: 'bold'
                  }}>
                    {item.powerOutput.toFixed(1)}W
                  </span>
                </td>
                <td style={{ 
                  padding: '10px', 
                  color: item.prediction === 'Normal' ? '#4caf50' : '#f44336',
                  fontWeight: 'bold'
                }}>
                  {item.prediction}
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    color: item.confidence > 0.9 ? '#4caf50' : item.confidence > 0.7 ? '#ff9800' : '#f44336',
                    fontWeight: 'bold'
                  }}>
                    {(item.confidence * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart Interpretation */}
      <div style={{ marginTop: '15px', padding: '10px', background: '#e3f2fd', borderRadius: '6px', fontSize: '0.85rem', color: '#1565c0' }}>
        ℹ️ <strong>How to Read:</strong> 
        • Green bars = Normal predictions, Red bars = Failure alerts<br/>
        • Voltage (ideal: 11.5-12.5V), Temperature (ideal: 20-35°C), Power (ideal: 150-250W)<br/>
        • Anomalies detected when patterns deviate from normal operating conditions
      </div>
    </div>
  );
};

export default PredictionChart;