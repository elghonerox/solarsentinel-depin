import React from 'react';

/**
 * Hedera Transactions Component
 * 
 * Displays blockchain transaction details:
 * - HCS (Consensus Service) message ID
 * - HTS (Token Service) transfer details
 * - Links to HashScan testnet explorer
 * 
 * Props:
 * - hederaInfo: { transactionId, topicId, tokensEarned, accountId }
 */
const HederaTransactions = ({ hederaInfo }) => {
  if (!hederaInfo) return null;

  const HASHSCAN_BASE = 'https://hashscan.io/testnet';

  return (
    <div>
      <h2>⛓️ Hedera Blockchain Integration</h2>
      
      <div className="metric">
        <span className="metric-label">HCS Topic ID:</span>
        <span className="metric-value" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
          {hederaInfo.topicId || '0.0.XXXXXX'}
          {hederaInfo.topicId && (
            <a 
              href={`${HASHSCAN_BASE}/topic/${hederaInfo.topicId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: '10px', color: '#00D4AA', textDecoration: 'none' }}
            >
              🔗 View
            </a>
          )}
        </span>
      </div>

      <div className="metric">
        <span className="metric-label">Transaction ID:</span>
        <span className="metric-value" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
          {hederaInfo.transactionId || 'Pending...'}
          {hederaInfo.transactionId && (
            <a 
              href={`${HASHSCAN_BASE}/transaction/${hederaInfo.transactionId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: '10px', color: '#00D4AA', textDecoration: 'none' }}
            >
              🔗 View
            </a>
          )}
        </span>
      </div>

      <div className="metric">
        <span className="metric-label">Tokens Earned (ETK):</span>
        <span className="metric-value" style={{ fontSize: '1.2rem', color: '#00D4AA', fontWeight: 'bold' }}>
          {hederaInfo.tokensEarned || 0} ETK
        </span>
      </div>

      {hederaInfo.tokenId && (
        <div className="metric">
          <span className="metric-label">Token ID:</span>
          <span className="metric-value" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {hederaInfo.tokenId}
            <a 
              href={`${HASHSCAN_BASE}/token/${hederaInfo.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: '10px', color: '#00D4AA', textDecoration: 'none' }}
            >
              🔗 View
            </a>
          </span>
        </div>
      )}

      {/* Transaction Status */}
      <div style={{ marginTop: '15px', padding: '10px', background: hederaInfo.tokensEarned ? '#e8f5e9' : '#fff3e0', borderRadius: '6px' }}>
        <div style={{ fontWeight: 'bold', color: hederaInfo.tokensEarned ? '#2e7d32' : '#e65100' }}>
          {hederaInfo.tokensEarned ? '✅ Rewards Distributed' : '⚠️ No Rewards (Failure Detected)'}
        </div>
        <div style={{ fontSize: '0.85rem', marginTop: '5px', color: hederaInfo.tokensEarned ? '#2e7d32' : '#e65100' }}>
          {hederaInfo.tokensEarned 
            ? 'Normal operation detected. 1.0 ETK minted to your account.'
            : 'Anomaly detected. No tokens minted. Maintenance recommended.'
          }
        </div>
      </div>

      {/* Cost Analysis */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f8ff', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '10px', fontSize: '1rem', color: '#333' }}>💰 Cost Analysis</h3>
        <div className="metric">
          <span className="metric-label">Testnet Cost:</span>
          <span className="metric-value" style={{ color: '#4caf50' }}>FREE</span>
        </div>
        <div className="metric">
          <span className="metric-label">Mainnet Cost (projected):</span>
          <span className="metric-value">$0.0001 per message</span>
        </div>
        <div className="metric">
          <span className="metric-label">Daily Cost (288 readings):</span>
          <span className="metric-value">$0.029/day</span>
        </div>
        <div className="metric">
          <span className="metric-label">Annual Cost per Panel:</span>
          <span className="metric-value" style={{ color: '#667eea', fontWeight: 'bold' }}>$10.50/year</span>
        </div>
      </div>

      {/* Why Hedera Explanation */}
      <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '6px', fontSize: '0.85rem', color: '#2e7d32' }}>
        ✅ <strong>Why Hedera?</strong> At $0.0001 per transaction, logging 288 daily readings costs just $10.50/year. 
        Compare this to prevented maintenance losses of $6,298 (if deployed) = 61,780% ROI. Plus: 3-5s finality, carbon-negative, and native token service.
      </div>
    </div>
  );
};

export default HederaTransactions;