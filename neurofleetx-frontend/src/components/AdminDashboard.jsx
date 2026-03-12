import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [stats] = useState({
    totalUsers: 150,
    totalDrivers: 42,
    totalManagers: 10,
    activeTrips: 18,
    totalRevenue: 325000,
    systemHealth: "Excellent"
  });

  const [recentActivity] = useState([
    { id: 1, text: "Driver Rajesh completed Trip #TRP1021", time: "5 mins ago" },
    { id: 2, text: "New customer Ananya registered", time: "12 mins ago" },
    { id: 3, text: "Vehicle TS09AB1236 added", time: "25 mins ago" },
    { id: 4, text: "Maintenance scheduled for TS10XY4567", time: "1 hour ago" },
    { id: 5, text: "Fleet Manager Ravi assigned Driver Vikram", time: "2 hours ago" },
    { id: 6, text: "Customer Priya cancelled Trip #TRP1030", time: "3 hours ago" },
    { id: 7, text: "Driver Amit Singh started shift", time: "3 hours ago" },
    { id: 8, text: "Payment of ₹850 received from Customer Meera", time: "4 hours ago" },
    { id: 9, text: "New driver Kiran Kumar registered", time: "5 hours ago" },
    { id: 10, text: "Vehicle TS08XY5678 maintenance completed", time: "6 hours ago" },
    { id: 11, text: "Trip #TRP1019 assigned to Driver Suresh", time: "7 hours ago" },
    { id: 12, text: "Customer Rahul booked trip to Warangal", time: "8 hours ago" }
  ]);

  const [monthlyRevenue] = useState([18000, 25000, 22000, 28000, 35000, 32000]);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Admin";
    setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <nav className="dashboard-navbar">
        <div className="navbar-brand">NeuroFleetX</div>
        <ul className="navbar-menu">
          <li className="active" onClick={() => navigate("/admin")}>Dashboard</li>
          <li onClick={() => navigate("/admin/users")}>Users</li>
          <li onClick={() => navigate("/admin/drivers")}>Drivers</li>
          <li onClick={() => navigate("/admin/analytics")}>Analytics</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {userName}! Monitor and manage your fleet system</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚗</div>
            <div className="stat-info">
              <h3>{stats.totalDrivers}</h3>
              <p>Total Drivers</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👔</div>
            <div className="stat-info">
              <h3>{stats.totalManagers}</h3>
              <p>Fleet Managers</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <h3>{stats.activeTrips}</h3>
              <p>Active Trips</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>₹{stats.totalRevenue}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.systemHealth}</h3>
              <p>System Health</p>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h2>Revenue Trends</h2>
          <div className="revenue-chart">
            <div className="chart-bars">
              {monthlyRevenue.map((revenue, index) => {
                const maxRevenue = Math.max(...monthlyRevenue);
                const height = (revenue / maxRevenue) * 100;
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                return (
                  <div key={index} className="bar-container">
                    <div className="bar" style={{ height: `${height}%` }}>
                      <span className="bar-value">₹{(revenue / 1000).toFixed(0)}k</span>
                    </div>
                    <span className="bar-label">{months[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="actions-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn primary" onClick={() => navigate("/admin/users")}>Add New User</button>
            <button className="action-btn secondary" onClick={() => navigate("/admin/drivers")}>Manage Drivers</button>
            <button className="action-btn secondary" onClick={() => navigate("/admin/analytics")}>View Reports</button>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">🔔</div>
                <div className="activity-content">
                  <p className="activity-text">{activity.text}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
