import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/pages.css";

function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:8082/api/reports/manager/test');
      setReports(response.data);
      console.log("✅ Loaded reports:", response.data);
    } catch (error) {
      console.error("❌ Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
          <h1>Reports & Analytics</h1>
        </div>
        <div className="empty-state">
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
        <h1>Reports & Analytics</h1>
      </div>

      {reports && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
              ₹{reports.totalRevenue?.toLocaleString()}
            </p>
          </div>
          
          <div className="stat-card">
            <h3>Total Trips</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3' }}>
              {reports.totalTrips}
            </p>
          </div>
          
          <div className="stat-card">
            <h3>Completed Trips</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
              {reports.completedTrips}
            </p>
          </div>
          
          <div className="stat-card">
            <h3>Active Trips</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF9800' }}>
              {reports.activeTrips}
            </p>
          </div>
          
          <div className="stat-card">
            <h3>Cancelled Trips</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336' }}>
              {reports.cancelledTrips}
            </p>
          </div>
          
          <div className="stat-card">
            <h3>Total Vehicles</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9C27B0' }}>
              {reports.totalVehicles}
            </p>
          </div>
          
          <div className="stat-card">
            <h3>Total Drivers</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00BCD4' }}>
              {reports.totalDrivers}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
