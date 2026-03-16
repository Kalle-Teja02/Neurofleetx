import { useState, useEffect } from 'react';
import '../styles/kpiSummaryCards.css';

export default function KPISummaryCards() {
  const [kpiData, setKpiData] = useState({
    totalVehicles: 0,
    criticalIssues: 0,
    nextMaintenance: 'N/A'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIData();
  }, []);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      
      // Mock data - simulating KPI metrics
      const mockKPIData = {
        totalVehicles: 45,
        criticalIssues: 2,
        nextMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      };

      setKpiData(mockKPIData);
    } catch (error) {
      console.error('Error loading KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Vehicles Monitored',
      value: kpiData.totalVehicles,
      icon: '🚗',
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    {
      title: 'Vehicles with Critical Issues',
      value: kpiData.criticalIssues,
      icon: '⚠️',
      color: '#ef4444',
      bgColor: '#fef2f2'
    },
    {
      title: 'Next Scheduled Maintenance',
      value: kpiData.nextMaintenance,
      icon: '📅',
      color: '#10b981',
      bgColor: '#f0fdf4'
    }
  ];

  return (
    <div className="kpi-summary-cards-container">
      {loading ? (
        <div className="loading">Loading KPI data...</div>
      ) : (
        <div className="cards-grid">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className="kpi-card"
              style={{ backgroundColor: card.bgColor, borderLeftColor: card.color }}
            >
              <div className="card-header">
                <span className="card-icon">{card.icon}</span>
                <h4 className="card-title">{card.title}</h4>
              </div>
              <div className="card-value" style={{ color: card.color }}>
                {typeof card.value === 'number' ? (
                  <span className="number">{card.value}</span>
                ) : (
                  <span className="text">{card.value}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
