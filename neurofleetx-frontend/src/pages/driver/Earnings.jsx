import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

function Earnings() {
  const navigate = useNavigate();
  const [earnings] = useState({
    today: 3100,
    week: 10500,
    month: 42800,
    total: 187500
  });

  const [weeklyData] = useState([650, 850, 1400, 1100, 1700, 1300, 1900]);

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/driver")} className="back-btn">← Back</button>
        <h1>My Earnings</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today</h3>
          <p className="amount">₹{earnings.today}</p>
        </div>
        <div className="stat-card">
          <h3>This Week</h3>
          <p className="amount">₹{earnings.week}</p>
        </div>
        <div className="stat-card">
          <h3>This Month</h3>
          <p className="amount">₹{earnings.month}</p>
        </div>
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p className="amount">₹{earnings.total}</p>
        </div>
      </div>

      <div className="chart-card">
        <h3>Earnings Trend (Last 7 Days)</h3>
        <div className="chart-bars">
          {weeklyData.map((earning, index) => {
            const maxEarning = Math.max(...weeklyData);
            const height = (earning / maxEarning) * 100;
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return (
              <div key={index} className="bar-container">
                <div className="bar" style={{ height: `${height}%`, background: 'linear-gradient(180deg, #28a745 0%, #218838 100%)' }}>
                  <span className="bar-value">₹{earning}</span>
                </div>
                <span className="bar-label">{days[index]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Earnings;
