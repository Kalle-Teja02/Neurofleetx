import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/fleetDashboard.css";

const FleetManagerDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeTrips: 0,
    totalVehicles: 0,
    activeDrivers: 0,
    averageTripRevenue: 0,
    topDriverName: "N/A",
    motivationalMessage: ""
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Fleet Manager";
    setUserName(name);
    
    // Fetch dashboard data (no ID needed, backend will auto-detect)
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("🔍 Fetching dashboard data...");
      console.log("🔍 Token from localStorage:", token ? token.substring(0, 30) + "..." : "NULL");
      
      // Try test endpoint first (no auth required)
      console.log("🔍 Using TEST endpoint (no auth required)");
      const response = await axios.get(`http://localhost:8082/api/fleet/dashboard/test`);
      
      console.log("✅ Dashboard data received:", response.data);
      const data = response.data;
      
      setStats({
        totalRevenue: data.totalRevenue,
        activeTrips: data.activeTrips,
        totalVehicles: data.totalVehicles,
        activeDrivers: data.activeDrivers,
        averageTripRevenue: data.averageTripRevenue,
        topDriverName: data.topDriverName,
        motivationalMessage: data.motivationalMessage
      });
      
      setMonthlyRevenue(data.monthlyRevenue);
      setRecentTrips(data.recentTrips);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      console.error("Error response:", error.response);
      
      alert(`Failed to load dashboard data: ${error.message}`);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="fleet-dashboard">
        <div className="container">
          <div className="main">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h2>Loading dashboard...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fleet-dashboard">
      <div className="container">
      
        {/* Sidebar */}
        <div className="sidebar">
          <h2 className="logo">Neuro<span>FleetX</span></h2>
          <ul>
            <li className="active" onClick={() => navigate("/manager")}>Dashboard</li>
            <li onClick={() => navigate("/manager/fleet")}>Fleet</li>
            <li onClick={() => navigate("/fleet-inventory")}>Fleet Inventory</li>
            <li onClick={() => navigate("/manager/drivers")}>Drivers</li>
            <li onClick={() => navigate("/manager/trips")}>Trips</li>
            <li onClick={() => navigate("/manager/maintenance")}>Maintenance</li>
            <li onClick={() => navigate("/manager/reports")}>Reports</li>
          </ul>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        {/* Main Content */}
        <div className="main">

          {/* Topbar */}
          <div className="topbar">
            <h1>Fleet Manager Dashboard</h1>
            <div className="profile">{userName}</div>
          </div>

          {/* Motivational Message */}
          {stats.motivationalMessage && (
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '1.2rem',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              💡 {stats.motivationalMessage}
            </div>
          )}

          {/* KPI Cards */}
          <div className="cards">
            <div className="card">
              <h3>Total Revenue</h3>
              <p>₹{stats.totalRevenue.toLocaleString()}</p>
            </div>

            <div className="card">
              <h3>Active Trips</h3>
              <p>{stats.activeTrips}</p>
            </div>

            <div className="card">
              <h3>Total Vehicles</h3>
              <p>{stats.totalVehicles}</p>
            </div>

            <div className="card">
              <h3>Active Drivers</h3>
              <p>{stats.activeDrivers}</p>
            </div>

            <div className="card">
              <h3>Avg Trip Revenue</h3>
              <p>₹{stats.averageTripRevenue.toFixed(2)}</p>
            </div>

            <div className="card">
              <h3>Top Driver</h3>
              <p style={{fontSize: '1rem'}}>{stats.topDriverName}</p>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="analytics">

            <div className="chart-box">
              <h3>Monthly Revenue</h3>
              <div className="monthly-revenue-list">
                {Object.keys(monthlyRevenue).length > 0 ? (
                  Object.entries(monthlyRevenue).map(([month, revenue]) => (
                    <div key={month} className="revenue-item">
                      <span className="month-name">{month}</span>
                      <span className="revenue-amount">₹{revenue.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p style={{textAlign: 'center', color: '#888'}}>No revenue data</p>
                )}
              </div>
            </div>

            <div className="traffic-box">
              <h3>Traffic Analytics</h3>
              <p>Trip performance insights & fleet efficiency analytics.</p>
              <button onClick={() => navigate("/manager/reports")}>View Details</button>
            </div>

          </div>

          {/* Recent Trips Section */}
          <div className="table-section">
            <h3>Recent Trips</h3>

            <table>
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Revenue</th>
                </tr>
              </thead>

              <tbody>
                {recentTrips.length > 0 ? (
                  recentTrips.map((trip) => (
                    <tr key={trip.tripId}>
                      <td>{trip.tripId}</td>
                      <td>{trip.driverName}</td>
                      <td>
                        <span className={`status-badge ${trip.status.toLowerCase()}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td>₹{trip.revenue.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No trips available
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FleetManagerDashboard;