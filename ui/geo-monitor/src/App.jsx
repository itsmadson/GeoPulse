import React, { useEffect, useState } from 'react';
import './App.css';
import MetricCard from './components/MetricCard';
import StatusHeader from './components/StatusHeader';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [metrics, setMetrics] = useState([]);
  const [metricsHistory, setMetricsHistory] = useState({});
  const [requests, setRequests] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(0);

  const fetchMetrics = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('http://localhost:8000/geoserver-status');
      const currentLatency = performance.now() - startTime;
      setLatency(currentLatency);
      
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      
      const data = await response.json();
      const currentMetrics = data.metrics.metric || [];
      setMetrics(currentMetrics);
      
      // Update metrics history for charts
      setMetricsHistory(prev => {
        const newHistory = { ...prev };
        currentMetrics.forEach(metric => {
          const metricId = `${metric.category}-${metric.name}`;
          if (!newHistory[metricId]) {
            newHistory[metricId] = [];
          }
          
          // Convert value to number if possible
          let value = metric.value;
          if (typeof value === 'string') {
            const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
            if (!isNaN(numValue)) value = numValue;
          }
          
          // Add new data point
          newHistory[metricId].push({
            time: new Date().toLocaleTimeString(),
            value: value
          });
          
          // Keep only the last 20 data points
          if (newHistory[metricId].length > 20) {
            newHistory[metricId].shift();
          }
        });
        return newHistory;
      });
      
      setRequests(prev => prev + 1);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
      setError(null);
      return currentLatency;
    } catch (err) {
      console.error('Error fetching:', err);
      setConnectionStatus('error');
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMetrics();
    
    // Then set up interval
    const interval = setInterval(async () => {
      await fetchMetrics();
    }, 5000); // Changed to 5 seconds to reduce load
    
    return () => clearInterval(interval);
  }, []);

  // Group metrics by category for better organization
  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {});

  // Create a filtered view of important metrics for the main dashboard
  const importantCategories = ['CPU', 'MEMORY', 'FILE_SYSTEM', 'NETWORK', 'GEOSERVER'];
  const filteredMetrics = Object.entries(groupedMetrics)
    .filter(([category]) => importantCategories.includes(category))
    .reduce((acc, [category, metrics]) => {
      // For each category, take the most critical metrics based on priority
      acc[category] = metrics
        .sort((a, b) => a.priority - b.priority)
        .slice(0, category === 'GEOSERVER' ? 3 : 2); // Take more GeoServer metrics
      return acc;
    }, {});

  return (
    <div className="cyber-container">
      <StatusHeader
        requests={requests}
        status={connectionStatus}
        lastUpdate={lastUpdate}
        error={error}
        latency={latency}
      />
      
      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Performance Overview Section with Charts */}
          <section className="dashboard-overview">
            <h2 className="section-title">SYSTEM PERFORMANCE</h2>
            <div className="charts-container">
              {/* CPU Chart */}
              <div className="chart-card">
                <h3 className="chart-title">CPU UTILIZATION</h3>
                <div className="chart-content">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={metricsHistory['CPU-USED'] || []}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="var(--cyber-blue)" 
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <XAxis dataKey="time" hide={true} />
                      <YAxis domain={[0, 100]} hide={true} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--cyber-panel)', 
                          border: '1px solid var(--cyber-blue)',
                          borderRadius: '4px'
                        }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Memory Chart */}
              <div className="chart-card">
                <h3 className="chart-title">MEMORY USAGE</h3>
                <div className="chart-content">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={metricsHistory['MEMORY-USED'] || []}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="var(--cyber-purple)" 
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <XAxis dataKey="time" hide={true} />
                      <YAxis domain={[0, 100]} hide={true} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--cyber-panel)', 
                          border: '1px solid var(--cyber-purple)',
                          borderRadius: '4px'
                        }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Network Chart */}
              <div className="chart-card">
                <h3 className="chart-title">NETWORK TRAFFIC</h3>
                <div className="chart-content">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={metricsHistory['NETWORK-INCOMING'] || []}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="var(--cyber-green)" 
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <XAxis dataKey="time" hide={true} />
                      <YAxis hide={true} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--cyber-panel)', 
                          border: '1px solid var(--cyber-green)',
                          borderRadius: '4px'
                        }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* GeoServer Requests Chart */}
              <div className="chart-card">
                <h3 className="chart-title">GEOSERVER REQUESTS</h3>
                <div className="chart-content">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={metricsHistory['GEOSERVER-REQUESTS'] || []}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="var(--cyber-pink)" 
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <XAxis dataKey="time" hide={true} />
                      <YAxis hide={true} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--cyber-panel)', 
                          border: '1px solid var(--cyber-pink)',
                          borderRadius: '4px'
                        }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
          
          {/* Metrics Cards Section */}
          <div className="metrics-sections">
            {Object.entries(filteredMetrics).map(([category, categoryMetrics]) => (
              <section key={category} className="metrics-section">
                <h2 className="section-title">{category.replace('_', ' ')}</h2>
                <div className="metrics-grid">
                  {categoryMetrics.map((metric, index) => (
                    <MetricCard
                      key={`${category}-${index}`}
                      metric={metric}
                      chartData={metricsHistory[`${metric.category}-${metric.name}`] || []}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      
      <div className="cyberpunk-effects">
        <div className="grid-effect"></div>
        <div className="grid-effect-h"></div>
        <div className="scanline"></div>
        <div className="glow-circle c1"></div>
        <div className="glow-circle c2"></div>
        <div className="glow-circle c3"></div>
      </div>
      
      <footer className="cyber-footer">
        <div className="footer-content">
          <div className="system-pulse"></div>
          <p>GEO SERVER MONITOR v3.0.0 | SYSTEM STATUS: <span className={connectionStatus}>{connectionStatus.toUpperCase()}</span></p>
          <div className="system-pulse"></div>
        </div>
      </footer>
    </div>
  );
}

export default App;