import React, { useEffect, useState } from 'react';
import { FaServer, FaExclamationTriangle, FaNetworkWired, FaClock, FaHistory } from 'react-icons/fa';

const StatusHeader = ({ requests, status, lastUpdate, error, latency }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString();
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="status-indicator connected">
            <div className="indicator-dot"></div>
            <div className="indicator-pulse"></div>
          </div>
        );
      case 'error':
        return (
          <div className="status-indicator error">
            <div className="indicator-dot"></div>
            <div className="indicator-pulse"></div>
          </div>
        );
      default:
        return (
          <div className="status-indicator connecting">
            <div className="indicator-dot"></div>
            <div className="indicator-pulse"></div>
          </div>
        );
    }
  };

  return (
    <header className="cyber-header">
      <div className="header-main">
        <div className="logo-container">
          <div className="logo-glow"></div>
          <div className="logo-wrapper">
            <FaServer className="cyber-logo" />
          </div>
          <h1 className="cyber-title">GEO SERVER<span>MONITOR</span></h1>
        </div>
        
        <div className="status-display">
          <div className="status-item">
            {getStatusIndicator()}
            <span className="status-label">STATUS:</span>
            <span className={`status-value ${status}`}>{status.toUpperCase()}</span>
          </div>
          
          <div className="status-item">
            <FaNetworkWired className="status-icon" />
            <span className="status-label">REQUESTS:</span>
            <span className="status-value">{requests}</span>
          </div>
          
          <div className="status-item">
            <FaHistory className="status-icon" />
            <span className="status-label">UPDATED:</span>
            <span className="status-value">{formatTime(lastUpdate)}</span>
          </div>
          
          <div className="status-item">
            <FaClock className="status-icon" />
            <span className="status-label">TIME:</span>
            <span className="status-value">{formatTime(currentTime)}</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">LATENCY:</span>
            <span className="status-value">{latency.toFixed(0)} ms</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="error-alert">
          <FaExclamationTriangle className="error-icon" />
          <div className="error-message">SYSTEM ERROR: {error}</div>
          <div className="error-pulse"></div>
        </div>
      )}
      
      <div className="header-decorations">
        <div className="header-line"></div>
        <div className="header-corners">
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
        </div>
      </div>
    </header>
  );
};

export default StatusHeader;