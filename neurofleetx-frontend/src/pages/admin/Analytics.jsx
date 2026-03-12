import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

function Analytics() {
  const navigate = useNavigate();
  
  const [revenueData] = useState([18000, 25000, 22000, 28000, 35000, 32000]);
  const [userGrowth] = useState([25, 42, 58, 75, 105, 150]);
  const [tripStats] = useState([52, 89, 108, 135, 162, 187]);
  const [driverPerformance] = useState([4.3, 4.5, 4.6, 4.7, 4.8, 4.7]);

  const renderChart = (data, label, color) => {
    const maxValue = Math.max(...data);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return (
      <div className="chart-bars">
        {data.map((value, index) => {
          const height = (value / maxValue) * 100;
          return (
            <div key={index} className="bar-container">
              <div className="bar" style={{ height: `${height}%`, background: color }}>
                <span className="bar-value">{value}</span>
              </div>
              <span className="bar-label">{months[index]}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/admin")} className="back-btn">← Back</button>
        <h1>Analytics</h1>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Revenue Trends (₹)</h3>
          {renderChart(revenueData, 'Revenue', 'linear-gradient(180deg, #0d6efd 0%, #0b5ed7 100%)')}
        </div>

        <div className="chart-card">
          <h3>User Growth</h3>
          {renderChart(userGrowth, 'Users', 'linear-gradient(180deg, #28a745 0%, #218838 100%)')}
        </div>

        <div className="chart-card">
          <h3>Trip Statistics</h3>
          {renderChart(tripStats, 'Trips', 'linear-gradient(180deg, #ffc107 0%, #e0a800 100%)')}
        </div>

        <div className="chart-card">
          <h3>Driver Performance (Rating)</h3>
          {renderChart(driverPerformance, 'Rating', 'linear-gradient(180deg, #6f42c1 0%, #5a32a3 100%)')}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
