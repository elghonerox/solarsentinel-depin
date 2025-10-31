import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Token Balance Component
 * 
 * Displays current EnergyToken (ETK) balance
 * Explains token economics and rewards system
 * 
 * Note: Tokens are on Hedera TESTNET only (no real value)
 */
const TokenBalance = ({ hederaInfo }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, [hederaInfo]);

  const fetchBalance = async () => {
    try {
      const balanceData = await api.getTokenBalance();
      setBalance(balanceData.balance || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      // If balance fetch fails, calculate from local state
      if (hederaInfo && hederaInfo.tokensEarned) {
        setBalance(prev => prev + hederaInfo.tokensEarned);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>🪙 EnergyToken (ETK) Balance</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="spinner" style={{ width: '30px', height: '30px' }}></div>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <div style={{ fontSize: '3rem', color: '#00D4AA', fontWeight: 'bold' }}>
              {balance.toFixed(2)}
            </div>
            <div style={{ fontSize: '1rem', color: '#666' }}>ETK</div>
          </div>

          {/* Token Economics Explanation */}
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Reward System</h3>
            <div className="metric">
              <span className="metric-label">Normal Reading:</span>
              <span className="metric-value">+1.0 ETK</span>
            </div>
            <div className="metric">
              <span className="metric-label">Preventive Action:</span>
              <span className="metric-value">+2.5 ETK</span>
            </div>
            <div className="metric">
              <span className="metric-label">Community Milestone:</span>
              <span className="metric-value">+5.0 ETK</span>
            </div>
          </div>

          {/* Token Utility (Hypothetical) */}
          <div style={{ marginTop: '15px', padding: '10px', background: '#fff3e0', borderRadius: '6px', fontSize: '0.85rem', color: '#e65100' }}>
            ⚠️ <strong>Testnet Tokens:</strong> These tokens are on Hedera testnet and have no real-world value. 
            In production, ETK could be redeemed for maintenance services or exchanged for carbon credits. 
            Token economics require field validation with actual users.
          </div>
        </>
      )}
    </div>
  );
};

export default TokenBalance;