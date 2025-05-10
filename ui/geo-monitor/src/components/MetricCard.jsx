import React from 'react';
import {
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaNetworkWired,
  FaThermometerHalf,
  FaFan,
  FaServer,
  FaChartLine
} from 'react-icons/fa';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const MetricCard = ({ metric, chartData }) => {
  const getIcon = () => {
    switch (metric.category) {
      case 'CPU': return <FaMicrochip className="icon cpu-icon" />;
      case 'MEMORY': return <FaMemory className="icon memory-icon" />;
      case 'FILE_SYSTEM': return <FaHdd className="icon storage-icon" />;
      case 'NETWORK': return <FaNetworkWired className="icon network-icon" />;
      case 'SENSORS':
        return metric.name.includes('FAN')
          ? <FaFan className="icon fan-icon" />
          : <FaThermometerHalf className="icon temp-icon" />;
      case 'GEOSERVER': return <FaServer className="icon server-icon" />;
      default: return <FaChartLine className="icon default-icon" />;
    }
  };

  const getValueColor = () => {
    if (!metric.value) return '';
    
    const numValue = typeof metric.value === 'string'
      ? parseFloat(metric.value.replace(/[^0-9.]/g, ''))
      : metric.value;
      
    if (isNaN(numValue)) return '';
    
    if (metric.unit === '%' || metric.name.includes('USED') || metric.name.includes('LOAD')) {
      if (numValue > 90) return 'critical';
      if (numValue > 70) return 'warning';
    }
    
    if (metric.category === 'SENSORS' && metric.unit === '°C' && numValue > 70) {
      return 'critical';
    }
    
    return '';
  };

  // Convert metric value to a number if possible
  const getNumericValue = () => {
    if (!metric.value) return 0;
    
    if (typeof metric.value === 'number') return metric.value;
    
    const numValue = parseFloat(metric.value.replace(/[^0-9.]/g, ''));
    return isNaN(numValue) ? 0 : numValue;
  };

  const numericValue = getNumericValue();
  const statusClass = getValueColor();
  const iconColor = 
    statusClass === 'critical' ? 'var(--cyber-critical)' : 
    statusClass === 'warning' ? 'var(--cyber-warning)' : 
    null; // use default color from category

  const getChartColor = () => {
    switch (metric.category) {
      case 'CPU': return 'var(--cyber-blue)';
      case 'MEMORY': return 'var(--cyber-purple)';
      case 'FILE_SYSTEM': return 'var(--cyber-green)';
      case 'NETWORK': return 'var(--cyber-pink)';
      case 'GEOSERVER': return '#00aaff';
      default: return 'var(--cyber-text-dim)';
    }
  };

  return (
    <div className={`metric-card ${statusClass}`}>
      <div className="metric-top">
        <div className="metric-header">
          <div className="icon-wrapper" style={iconColor ? { color: iconColor } : {}}>
            {getIcon()}
          </div>
          <div className="metric-titles">
            <h3 className="metric-name">{metric.name.replace(/_/g, ' ')}</h3>
            <p className="metric-description">{metric.description}</p>
          </div>
        </div>
        
        <div className="metric-value-container">
          <span className="metric-value">{metric.value}</span>
          <span className="metric-unit">{metric.unit}</span>
        </div>
      </div>
      
      <div className="metric-chart">
        {chartData && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={getChartColor()} 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="metric-indicator-bar">
        <div 
          className="indicator-fill" 
          style={{ 
            width: `${metric.unit === '%' ? numericValue : Math.min(numericValue, 100)}%`,
            backgroundColor: 
              statusClass === 'critical' ? 'var(--cyber-critical)' : 
              statusClass === 'warning' ? 'var(--cyber-warning)' : 
              getChartColor()
          }}
        ></div>
      </div>
      
      <div className="metric-priority">PRI: {metric.priority}</div>
      <div className="glow-effect"></div>
    </div>
  );
};

export default MetricCard;