import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../../styles/pages.css";
import "../../styles/analytics.css";

const STATUS_COLORS = { AVAILABLE: "#10b981", IN_USE: "#3b82f6", MAINTENANCE: "#ef4444" };

export default function Analytics() {
  const navigate = useNavigate();
  const role   = localStorage.getItem("role")   || "ADMIN";
  const userId = localStorage.getItem("userId") || "1";

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8082/api/analytics?role=${role}&userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch analytics");
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isDriver   = role === "DRIVER";
  const backPath   = role === "ADMIN" ? "/admin" : role === "FLEET_MANAGER" ? "/manager" : "/driver";

  if (loading) return <div className="page-container"><p className="an-loading">Loading analytics...</p></div>;
  if (error)   return <div className="page-container"><p className="an-error">⚠ {error}</p></div>;

  // Pie chart data from statusBreakdown
  const pieData = data?.statusBreakdown
    ? Object.entries(data.statusBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate(backPath)} className="back-btn">← Back</button>
        <h1>Analytics {isDriver ? "— My Vehicle" : "— Fleet Overview"}</h1>
      </div>

      {/* Role badge */}
      <div className="an-role-badge">
        Viewing as: <span className={`an-role ${role.toLowerCase()}`}>{role}</span>
      </div>

      {/* KPI cards */}
      <div className="an-kpi-grid">
        <div className="an-kpi-card">
          <p className="an-kpi-label">Total Vehicles</p>
          <h3 className="an-kpi-value">{data?.totalVehicles ?? 0}</h3>
        </div>
        <div className="an-kpi-card green">
          <p className="an-kpi-label">Available</p>
          <h3 className="an-kpi-value">{data?.available ?? 0}</h3>
        </div>
        <div className="an-kpi-card blue">
          <p className="an-kpi-label">In Use</p>
          <h3 className="an-kpi-value">{data?.inUse ?? 0}</h3>
        </div>
        <div className="an-kpi-card red">
          <p className="an-kpi-label">Maintenance</p>
          <h3 className="an-kpi-value">{data?.maintenance ?? 0}</h3>
        </div>
        <div className="an-kpi-card">
          <p className="an-kpi-label">Avg Battery</p>
          <h3 className="an-kpi-value">{data?.avgBattery ?? 0}%</h3>
        </div>
        <div className="an-kpi-card">
          <p className="an-kpi-label">Avg Fuel</p>
          <h3 className="an-kpi-value">{data?.avgFuel ?? 0}%</h3>
        </div>

        {/* Fleet-only KPIs */}
        {!isDriver && (
          <>
            <div className="an-kpi-card purple">
              <p className="an-kpi-label">Total Trips</p>
              <h3 className="an-kpi-value">{data?.totalTrips ?? 0}</h3>
            </div>
            <div className="an-kpi-card purple">
              <p className="an-kpi-label">Total Drivers</p>
              <h3 className="an-kpi-value">{data?.totalDrivers ?? 0}</h3>
            </div>
            <div className="an-kpi-card red">
              <p className="an-kpi-label">Low Battery Alerts</p>
              <h3 className="an-kpi-value">{data?.lowBatteryCount ?? 0}</h3>
            </div>
            <div className="an-kpi-card red">
              <p className="an-kpi-label">Low Fuel Alerts</p>
              <h3 className="an-kpi-value">{data?.lowFuelCount ?? 0}</h3>
            </div>
          </>
        )}
      </div>

      {/* Charts row — fleet only */}
      {!isDriver && pieData.length > 0 && (
        <div className="an-charts-row">
          <div className="an-chart-card">
            <h4>Vehicle Status Distribution</h4>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v} vehicles`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="an-chart-card">
            <h4>Fleet Health Overview</h4>
            <div className="an-health-bars">
              {[
                { label: "Avg Battery", value: data?.avgBattery ?? 0, color: "#3b82f6" },
                { label: "Avg Fuel",    value: data?.avgFuel    ?? 0, color: "#f59e0b" },
                { label: "Available %", value: data?.totalVehicles
                    ? Math.round((data.available / data.totalVehicles) * 100) : 0, color: "#10b981" },
              ].map(({ label, value, color }) => (
                <div key={label} className="an-health-row">
                  <span className="an-health-label">{label}</span>
                  <div className="an-health-bar-bg">
                    <div className="an-health-bar-fill" style={{ width: `${value}%`, background: color }} />
                  </div>
                  <span className="an-health-pct">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vehicle table */}
      <div className="an-table-card">
        <h4>{isDriver ? "My Assigned Vehicle" : "All Vehicles"}</h4>
        {data?.vehicles?.length === 0 ? (
          <p className="an-empty">{data?.message || "No vehicles found."}</p>
        ) : (
          <table className="an-table">
            <thead>
              <tr>
                <th>Vehicle No.</th>
                <th>Model</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Fuel</th>
                {!isDriver && <th>Speed</th>}
              </tr>
            </thead>
            <tbody>
              {data?.vehicles?.map(v => (
                <tr key={v.id}>
                  <td>{v.vehicleNumber}</td>
                  <td>{v.model}</td>
                  <td>
                    <span className={`an-status-badge ${v.status?.toLowerCase().replace('_', '-')}`}>
                      {v.status}
                    </span>
                  </td>
                  <td>{v.battery != null ? `${v.battery}%` : "—"}</td>
                  <td>{v.fuel    != null ? `${v.fuel}%`    : "—"}</td>
                  {!isDriver && <td>{v.speed != null ? `${v.speed} km/h` : "—"}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
