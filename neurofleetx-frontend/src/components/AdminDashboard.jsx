import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import "../styles/adminDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BASE = 'http://localhost:8082';

function AdminDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const token = localStorage.getItem('token');

  const [kpis, setKpis] = useState({
    totalFleet: 0, available: 0, inUse: 0, maintenance: 0,
    totalTrips: 0, tripsToday: 0, activeTrips: 0, completedTrips: 0,
    totalDrivers: 0, totalRevenue: 0,
  });
  const [revenueChart, setRevenueChart] = useState({ labels: [], data: [] });

  const [recentActivity] = useState([
    { id: 1,  text: "Driver Rajesh completed Trip #TRP1021",          time: "5 mins ago"  },
    { id: 2,  text: "New customer Ananya registered",                  time: "12 mins ago" },
    { id: 3,  text: "Vehicle TS09AB1236 added",                        time: "25 mins ago" },
    { id: 4,  text: "Maintenance scheduled for TS10XY4567",            time: "1 hour ago"  },
    { id: 5,  text: "Fleet Manager Ravi assigned Driver Vikram",        time: "2 hours ago" },
    { id: 6,  text: "Customer Priya cancelled Trip #TRP1030",          time: "3 hours ago" },
    { id: 7,  text: "Driver Amit Singh started shift",                  time: "3 hours ago" },
    { id: 8,  text: "Payment of ₹850 received from Customer Meera",    time: "4 hours ago" },
    { id: 9,  text: "New driver Kiran Kumar registered",                time: "5 hours ago" },
    { id: 10, text: "Vehicle TS08XY5678 maintenance completed",         time: "6 hours ago" },
  ]);

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    loadKpis();
  }, []);

  const loadKpis = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [aRes, vRes, tRes] = await Promise.all([
        fetch(`${BASE}/api/admin/analytics`, { headers }),
        fetch(`${BASE}/api/admin/vehicles`,  { headers }),
        fetch(`${BASE}/api/admin/trips`,     { headers }),
      ]);
      if (!aRes.ok || !vRes.ok || !tRes.ok) return;
      const [a, vehicles, trips] = await Promise.all([aRes.json(), vRes.json(), tRes.json()]);

      // Compute all KPIs client-side from raw data
      const completed  = trips.filter(t => t.status === 'COMPLETED');
      const active     = trips.filter(t => t.status === 'ACTIVE');
      const today      = new Date().toISOString().slice(0, 10);
      const tripsToday = trips.filter(t => (t.endTime || t.createdAt || '').slice(0, 10) === today).length;
      const revenue    = completed.reduce((s, t) => s + (t.fare || 0), 0);

      setKpis({
        totalFleet:    vehicles.length,
        available:     vehicles.filter(v => v.status === 'AVAILABLE').length,
        inUse:         vehicles.filter(v => v.status === 'IN_USE').length,
        maintenance:   vehicles.filter(v => v.status === 'MAINTENANCE').length,
        totalTrips:    trips.length,
        tripsToday,
        activeTrips:   active.length,
        completedTrips: completed.length,
        totalDrivers:  a.totalDrivers || 0,
        totalRevenue:  Math.round(revenue),
      });

      // Revenue last 7 days using endTime for completed trips
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return d.toISOString().slice(0, 10);
      });
      const revByDay = last7.map(d =>
        completed.filter(t => (t.endTime || '').slice(0, 10) === d)
                 .reduce((s, t) => s + (t.fare || 0), 0)
      );
      setRevenueChart({
        labels: last7.map(d => d.slice(5)), // MM-DD
        data:   revByDay.map(v => Math.round(v)),
      });
    } catch (e) {
      console.warn('Admin KPI fetch failed, using zeros:', e.message);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const KPI_CARDS = [
    { icon: '🚗', label: 'Total Fleet',     value: kpis.totalFleet    },
    { icon: '🟢', label: 'Available',        value: kpis.available     },
    { icon: '🔵', label: 'In Use',           value: kpis.inUse         },
    { icon: '🔧', label: 'Maintenance',      value: kpis.maintenance   },
    { icon: '📋', label: 'Total Trips',      value: kpis.totalTrips    },
    { icon: '📅', label: 'Trips Today',      value: kpis.tripsToday    },
    { icon: '🔄', label: 'Active Trips',     value: kpis.activeTrips   },
    { icon: '✅', label: 'Completed',        value: kpis.completedTrips},
    { icon: '👤', label: 'Active Drivers',   value: kpis.totalDrivers  },
    { icon: '💰', label: 'Total Revenue',    value: `₹${kpis.totalRevenue.toLocaleString()}` },
  ];

  return (
    <div className="admin-dashboard">
      <nav className="dashboard-navbar">
        <div className="navbar-brand">NeuroFleetX</div>
        <ul className="navbar-menu">
          <li className="active" onClick={() => navigate("/admin")}>Dashboard</li>
          <li onClick={() => navigate("/admin/users")}>Users</li>
          <li onClick={() => navigate("/admin/drivers")}>Drivers</li>
          <li onClick={() => navigate("/admin/analytics")}>Analytics</li>
          <li onClick={() => navigate("/admin/analytics-dashboard")}>Analytics Dashboard</li>
          <li onClick={() => navigate("/admin/fleet-map")}>Fleet Map</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {userName}! Monitor and manage your fleet system</p>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {KPI_CARDS.map(k => (
            <div key={k.label} className="stat-card">
              <div className="stat-icon">{k.icon}</div>
              <div className="stat-info">
                <h3>{k.value}</h3>
                <p>{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="actions-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn primary"    onClick={() => navigate("/admin/users")}>Add New User</button>
            <button className="action-btn secondary"  onClick={() => navigate("/admin/drivers")}>Manage Drivers</button>
            <button className="action-btn secondary"  onClick={() => navigate("/admin/analytics-dashboard")}>Analytics Dashboard</button>
            <button className="action-btn secondary"  onClick={() => navigate("/admin/fleet-map")}>Fleet Map</button>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="analytics-section">
          <h2>Revenue Trend — Last 7 Days</h2>
          {revenueChart.labels.length > 0 ? (
            <div style={{ maxHeight: 280, isolation: 'isolate' }}>
              <Bar
                data={{
                  labels: revenueChart.labels,
                  datasets: [{
                    label: 'Revenue ₹',
                    data: revenueChart.data,
                    backgroundColor: 'rgba(99,102,241,0.75)',
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    borderRadius: 6,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { callback: v => `₹${v.toLocaleString()}` } },
                  },
                }}
              />
            </div>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
              Loading revenue data...
            </p>
          )}
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map(a => (
              <div key={a.id} className="activity-item">
                <div className="activity-icon">🔔</div>
                <div className="activity-content">
                  <p className="activity-text">{a.text}</p>
                  <span className="activity-time">{a.time}</span>
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
