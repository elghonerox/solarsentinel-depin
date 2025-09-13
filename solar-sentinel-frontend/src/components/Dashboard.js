// components/Dashboard.js - Main Dashboard Component
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ data, impactMetrics, connectionStatus }) => {
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [viewMode, setViewMode] = useState('overview'); // overview, details, impact

  // Default empty data structure
  const defaultData = {
    sensorReadings: [],
    aiPredictions: [],
    hederaLogs: [],
    tokenBalance: 0,
    systemMetrics: {
      totalReadings: 0,
      successfulPredictions: 0,
      failedPredictions: 0,
      tokensEarned: 0,
      carbonSaved: 0,
      uptime: 0,
      successRate: 0
    }
  };

  const dashboardData = data || defaultData;
  const metrics = impactMetrics || null;

  // Get latest sensor reading for current status
  const latestReading = dashboardData.sensorReadings[dashboardData.sensorReadings.length - 1];
  const latestPrediction = dashboardData.aiPredictions[dashboardData.aiPredictions.length - 1];

  // Prepare chart data
  const chartData = {
    labels: dashboardData.sensorReadings.slice(-10).map((reading, index) => 
      `Reading ${dashboardData.sensorReadings.length - 10 + index + 1}`
    ),
    datasets: [
      {
        label: 'Voltage (V)',
        data: dashboardData.sensorReadings.slice(-10).map(r => r.sensorData?.voltage || 0),
        borderColor: 'rgb(255, 206, 84)',
        backgroundColor: 'rgba(255, 206, 84, 0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Temperature (°C)',
        data: dashboardData.sensorReadings.slice(-10).map(r => r.sensorData?.temp || 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1',
      },
      {
        label: 'Power Output (W)',
        data: dashboardData.sensorReadings.slice(-10).map(r => r.sensorData?.output || 0),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        yAxisID: 'y2',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Real-time Sensor Readings',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Sequence'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Voltage (V)'
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temperature (°C)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: 'linear',
        display: false,
      }
    },
  };

  // Get status color based on prediction
  const getStatusColor = (status) => {
    if (!status) return 'gray';
    if (status.includes('Normal')) return 'green';
    if (status.includes('Warning')) return 'orange';
    if (status.includes('Failure')) return 'red';
    return 'gray';
  };

  // Format uptime
  const formatUptime = (uptime) => {
    if (!uptime) return '0s';
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Filter data by selected device
  const getFilteredReadings = () => {
    if (selectedDevice === 'all') return dashboardData.sensorReadings;
    return dashboardData.sensorReadings.filter(reading => 
      reading.deviceId === selectedDevice
    );
  };

  // Get unique devices
  const getDevices = () => {
    const devices = [...new Set(dashboardData.sensorReadings.map(r => r.deviceId))];
    return devices.filter(Boolean);
  };

  if (viewMode === 'impact' && metrics) {
    return (
      <div className="dashboard impact-view">
        <div className="view-selector">
          <button 
            className={viewMode === 'overview' ? 'active' : ''}
            onClick={() => setViewMode('overview')}
          >
            Overview
          </button>
          <button 
            className={viewMode === 'details' ? 'active' : ''}
            onClick={() => setViewMode('details')}
          >
            Details
          </button>
          <button 
            className={viewMode === 'impact' ? 'active' : ''}
            onClick={() => setViewMode('impact')}
          >
            Impact
          </button>
        </div>

        <div className="impact-section">
          <h2>🌍 Global Impact Metrics</h2>
          
          <div className="impact-grid">
            <div className="impact-card highlight">
              <h3>🏠 Communities Served</h3>
              <div className="big-number">{metrics.socialImpact.householdsServed}</div>
              <p>Rural households with reliable solar monitoring</p>
            </div>

            <div className="impact-card">
              <h3>⚡ Energy Secured</h3>
              <div className="big-number">{metrics.socialImpact.energySecured}</div>
              <p>Total energy output monitored and protected</p>
            </div>

            <div className="impact-card">
              <h3>🌱 Carbon Credits</h3>
              <div className="big-number">{metrics.current.carbonSaved.toFixed(2)} kg</div>
              <p>CO₂ equivalent saved through early detection</p>
            </div>

            <div className="impact-card">
              <h3>💰 Economic Value</h3>
              <div className="big-number">${metrics.projections.yearly.economicValue.toFixed(2)}</div>
              <p>Projected annual value from carbon credits</p>
            </div>
          </div>

          <div className="projections-section">
            <h3>📈 Yearly Projections</h3>
            <div className="projection-cards">
              <div className="projection-card">
                <h4>Token Economy</h4>
                <p><strong>{metrics.projections.yearly.estimatedTokens.toFixed(0)}</strong> ETK tokens</p>
                <p>Distributed to maintenance providers</p>
              </div>
              <div className="projection-card">
                <h4>Carbon Impact</h4>
                <p><strong>{metrics.projections.yearly.estimatedCarbonCredits.toFixed(1)}</strong> kg CO₂</p>
                <p>Annual carbon footprint reduction</p>
              </div>
              <div className="projection-card">
                <h4>Uptime Improvement</h4>
                <p><strong>{metrics.socialImpact.preventedDowntime}</strong></p>
                <p>Prevented through predictive maintenance</p>
              </div>
            </div>
          </div>

          <div className="hackathon-highlight">
            <h3>🏆 Hackathon Innovation Highlights</h3>
            <div className="innovation-grid">
              <div className="innovation-item">
                <strong>🤖 AI-First Approach</strong>
                <p>Real-time anomaly detection preventing failures 48 hours in advance</p>
              </div>
              <div className="innovation-item">
                <strong>🔗 Blockchain Integration</strong>
                <p>Immutable data logging and tokenized rewards via Hedera network</p>
              </div>
              <div className="innovation-item">
                <strong>🌍 African Focus</strong>
                <p>Designed specifically for rural African solar installations</p>
              </div>
              <div className="innovation-item">
                <strong>📊 Complete DePIN</strong>
                <p>End-to-end decentralized physical infrastructure solution</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="view-selector">
        <button 
          className={viewMode === 'overview' ? 'active' : ''}
          onClick={() => setViewMode('overview')}
        >
          Overview
        </button>
        <button 
          className={viewMode === 'details' ? 'active' : ''}
          onClick={() => setViewMode('details')}
        >
          Details
        </button>
        <button 
          className={viewMode === 'impact' ? 'active' : ''}
          onClick={() => setViewMode('impact')}
        >
          Impact
        </button>
      </div>

      {/* Current Status Cards */}
      <div className="status-grid">
        <div className="status-card current-status">
          <h3>🔴 Live Status</h3>
          {latestReading ? (
            <div>
              <div className="device-info">
                <strong>{latestReading.deviceId || 'Unknown Device'}</strong>
                <p>{latestReading.location || 'Unknown Location'}</p>
              </div>
              <div className="sensor-values">
                <div className="sensor-value">
                  <span className="label">Voltage:</span>
                  <span className="value">{latestReading.sensorData?.voltage || 0}V</span>
                </div>
                <div className="sensor-value">
                  <span className="label">Temp:</span>
                  <span className="value">{latestReading.sensorData?.temp || 0}°C</span>
                </div>
                <div className="sensor-value">
                  <span className="label">Output:</span>
                  <span className="value">{latestReading.sensorData?.output || 0}W</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>⏳ Waiting for sensor data...</p>
            </div>
          )}
        </div>

        <div className="status-card ai-prediction">
          <h3>🤖 AI Prediction</h3>
          {latestPrediction && latestPrediction.success ? (
            <div>
              <div className={`prediction-status ${getStatusColor(latestPrediction.prediction?.status)}`}>
                {latestPrediction.prediction?.status || 'Unknown'}
              </div>
              <div className="prediction-details">
                <p><strong>Risk Level:</strong> {latestPrediction.prediction?.risk_level || 'N/A'}</p>
                <p><strong>Confidence:</strong> {latestPrediction.prediction?.confidence || 0}</p>
              </div>
              {latestPrediction.prediction?.recommendations && (
                <div className="recommendations">
                  <p><strong>Recommendations:</strong></p>
                  <ul>
                    {latestPrediction.prediction.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="no-data">
              <p>⏳ Processing AI prediction...</p>
            </div>
          )}
        </div>

        <div className="status-card token-balance">
          <h3>🪙 Token Balance</h3>
          <div className="balance-info">
            <div className="balance-amount">
              {dashboardData.tokenBalance.toFixed(2)} ETK
            </div>
            <div className="balance-details">
              <p>Total Earned: {dashboardData.systemMetrics.tokensEarned.toFixed(2)} ETK</p>
              <p>Carbon Saved: {dashboardData.systemMetrics.carbonSaved.toFixed(3)} kg CO₂</p>
            </div>
          </div>
        </div>

        <div className="status-card system-health">
          <h3>📊 System Metrics</h3>
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Success Rate</span>
              <span className="metric-value">{dashboardData.systemMetrics.successRate}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Uptime</span>
              <span className="metric-value">{formatUptime(dashboardData.systemMetrics.uptime)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Total Readings</span>
              <span className="metric-value">{dashboardData.systemMetrics.totalReadings}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Predictions</span>
              <span className="metric-value">{dashboardData.systemMetrics.successfulPredictions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {dashboardData.sensorReadings.length > 0 && (
        <div className="chart-section">
          <div className="chart-header">
            <h3>📈 Sensor Data Trends</h3>
            <div className="device-filter">
              <label htmlFor="device-select">Filter by Device:</label>
              <select 
                id="device-select"
                value={selectedDevice} 
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                <option value="all">All Devices</option>
                {getDevices().map(device => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Detailed Tables */}
      {viewMode === 'details' && (
        <div className="details-section">
          <div className="details-grid">
            <div className="details-card">
              <h3>📋 Recent Sensor Readings</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Device</th>
                      <th>Location</th>
                      <th>Voltage</th>
                      <th>Temp</th>
                      <th>Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredReadings().slice(-5).map((reading, index) => (
                      <tr key={reading.id || index}>
                        <td>{new Date(reading.timestamp).toLocaleTimeString()}</td>
                        <td>{reading.deviceId || 'Unknown'}</td>
                        <td>{reading.location || 'Unknown'}</td>
                        <td>{reading.sensorData?.voltage || 0}V</td>
                        <td>{reading.sensorData?.temp || 0}°C</td>
                        <td>{reading.sensorData?.output || 0}W</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="details-card">
              <h3>🔗 Hedera Blockchain Logs</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>HCS Sequence</th>
                      <th>Tokens Earned</th>
                      <th>Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.hederaLogs.slice(-5).map((log, index) => (
                      <tr key={log.id || index}>
                        <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td>{log.hcsLog?.sequenceNumber || 'N/A'}</td>
                        <td>{log.rewards?.earned ? `${log.rewards.amount} ETK` : 'No reward'}</td>
                        <td>
                          {log.rewards?.transactionId ? (
                            <a 
                              href={`https://hashscan.io/testnet/transaction/${log.rewards.transactionId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transaction-link"
                            >
                              View
                            </a>
                          ) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="actions-section">
        <h3>🛠️ Quick Actions</h3>
        <div className="actions-grid">
          <a 
            href="https://hashscan.io/testnet/topic/0.0.6596349" 
            target="_blank" 
            rel="noopener noreferrer"
            className="action-button"
          >
            🔍 View HCS Topic
          </a>
          <a 
            href="https://hashscan.io/testnet/token/0.0.6596350" 
            target="_blank" 
            rel="noopener noreferrer"
            className="action-button"
          >
            🪙 View Token Contract
          </a>
          <button 
            onClick={() => setViewMode('impact')}
            className="action-button primary"
          >
            📊 Impact Dashboard
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="action-button"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;