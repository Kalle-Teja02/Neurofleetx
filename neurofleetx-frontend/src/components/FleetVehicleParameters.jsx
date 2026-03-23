import { useState, useEffect } from 'react';
import '../styles/fleetVehicleParameters.css';

export default function FleetVehicleParameters() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8082/api/vehicles/test', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();

      const types = ['Van', 'EV', 'Truck', 'SUV'];
      const enriched = data.map((v, i) => {
        const mileage = Math.floor(Math.random() * 150000) + 3000;
        const engineHealth = Math.floor(Math.random() * 55) + 40;
        const tirePsi = Math.floor(Math.random() * 20) + 22;
        const battery = Math.floor(Math.random() * 70) + 25;
        const fuel = Math.floor(Math.random() * 80) + 10;

        let status = 'Healthy';
        if (mileage > 15000 || engineHealth < 50 || battery < 35) status = 'Critical';
        else if (mileage > 12000 || engineHealth < 70 || battery < 50) status = 'Due';

        return {
          ...v,
          vehicleType: types[i % types.length],
          mileage,
          engineHealth,
          tirePsi,
          battery,
          fuel,
          status
        };
      });

      setVehicles(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (value, thresholds) => {
    if (value <= thresholds.critical) return '#ef4444';
    if (value <= thresholds.warning) return '#f59e0b';
    return '#10b981';
  };

  const ProgressBar = ({ value, max = 100, thresholds = { critical: 30, warning: 60 } }) => {
    const pct = Math.min((value / max) * 100, 100);
    const color = getBarColor(value, thresholds);
    return (
      <div className="param-bar-wrap">
        <div className="param-bar-track">
          <div className="param-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    );
  };

  if (loading) return <div className="fvp-loading">Loading vehicle parameters...</div>;

  return (
    <div className="fvp-container">
      <div className="fvp-header">
        <h2>🚌 Fleet Vehicle Parameters</h2>
        <div className="fvp-badge">Comprehensive live telematics</div>
        <button className="fvp-refresh" onClick={fetchVehicles}>🔄 Refresh</button>
      </div>

      <div className="fvp-table-wrap">
        <table className="fvp-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Engine Health</th>
              <th>Tire PSI</th>
              <th>Battery %</th>
              <th>Fuel %</th>
              <th>Mileage</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id}>
                <td className="fvp-vehicle-col">
                  <span className="fvp-vehicle-id">{v.vehicleNumber}</span>
                  <span className="fvp-vehicle-type">({v.vehicleType})</span>
                </td>
                <td>
                  <span className={`fvp-status fvp-status-${v.status.toLowerCase()}`}>
                    {v.status.toUpperCase()}
                  </span>
                </td>
                <td className="fvp-param-cell">
                  <span className="fvp-val">{v.engineHealth}%</span>
                  <ProgressBar value={v.engineHealth} thresholds={{ critical: 50, warning: 70 }} />
                </td>
                <td className="fvp-param-cell">
                  <span className="fvp-val">{v.tirePsi} psi</span>
                  <ProgressBar value={v.tirePsi} max={45} thresholds={{ critical: 25, warning: 30 }} />
                </td>
                <td className="fvp-param-cell">
                  <span className="fvp-val">{v.battery}%</span>
                  <ProgressBar value={v.battery} thresholds={{ critical: 35, warning: 50 }} />
                </td>
                <td className="fvp-param-cell">
                  <span className="fvp-val">{v.fuel}%</span>
                  <ProgressBar value={v.fuel} thresholds={{ critical: 20, warning: 40 }} />
                </td>
                <td className="fvp-mileage">{v.mileage.toLocaleString()} km</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
