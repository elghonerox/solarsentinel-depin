// App.js - Main React Application
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [impactMetrics, setImpactMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Fetch dashboard data from integration API
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard-data`, {
        timeout: 10000
      });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
        setConnectionStatus('connected');
        setError(null);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message);
      setConnectionStatus('disconnected');
    }
  };

  // Fetch impact metrics
  const fetchImpactMetrics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/metrics/impact`, {
        timeout: 10000
      });
      
      if (response.data.success) {
        setImpactMetrics(response.data.impact);
      }
    } catch (err) {
      console.error('Impact metrics fetch error:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchImpactMetrics()
      ]);
      setLoading(false);
    };

    initialLoad();
  }, []);

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchDashboardData();
        // Update impact metrics less frequently
        if (Date.now() % 15000 < 5000) {
          fetchImpactMetrics();
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-container">
          <div className="solar-spinner"></div>
          <h2>🌞 SolarSentinel DePIN</h2>
          <p>Initializing AI-Blockchain Bridge...</p>
          <div className="loading-steps">
            <div className="step">✓ Connecting to Integration Layer</div>
            <div className="step">⏳ Loading Real-time Data</div>
            <div className="step">⏳ Syncing with Hedera Network</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🌞 SolarSentinel DePIN</h1>
            <p>AI-Powered Solar Panel Monitoring for African Communities</p>
          </div>
          <div className="connection-status">
            <div className={`status-indicator ${connectionStatus}`}></div>
            <span>{connectionStatus === 'connected' ? 'Live' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <strong>⚠️ Connection Issue:</strong> {error}
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry Connection
          </button>
        </div>
      )}

      <main className="app-main">
        <Dashboard 
          data={dashboardData} 
          impactMetrics={impactMetrics}
          connectionStatus={connectionStatus}
        />
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <strong>Hedera Africa Hackathon 2025</strong> | 
            Revolutionizing Rural Solar Maintenance with AI & Blockchain
          </div>
          <div className="footer-links">
            <a href="https://hashscan.io/testnet" target="_blank" rel="noopener noreferrer">
              Hedera Explorer
            </a>
            <span>|</span>
            <a href="#impact" onClick={() => document.querySelector('.impact-section')?.scrollIntoView()}>
              Impact Metrics
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;