import { useState, useEffect } from 'react';
import '../styles/maintenanceDashboard.css';

export default function MaintenanceDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [maintenancePredictions, setMaintenancePredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicleData();
    const interval = setInterval(fetchVehicleData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMaintenanceStatus = (mileage) => {
    if (mileage < 12000) return 'Healthy';
    if (mileage <= 15000) return 'Due Soon';
    return 'Critical';
  };

  const generateAlerts = (vehiclesList) => {
    const alertsList = [];
    vehiclesList.forEach(vehicle => {
      if (vehicle.engineHealth < 50) {
        alertsList.push({ id: `${vehicle.id}-engine-c`, vehicleNumber: vehicle.vehicleNumber, issue: 'Engine Health Critical', actionNeeded: 'Schedule Immediate Service', severity: 'high' });
      } else if (vehicle.engineHealth < 70) {
        alertsList.push({ id: `${vehicle.id}-engine-w`, vehicleNumber: vehicle.vehicleNumber, issue: 'Engine Health Degrading', actionNeeded: 'Monitor Performance', severity: 'medium' });
      }
      if (vehicle.tireCondition < 40) {
        alertsList.push({ id: `${vehicle.id}-tire-c`, vehicleNumber: vehicle.vehicleNumber, issue: 'Tire Pressure Low', actionNeeded: 'Inflate Tire', severity: 'high' });
      } else if (vehicle.tireCondition < 60) {
        alertsList.push({ id: `${vehicle.id}-tire-w`, vehicleNumber: vehicle.vehicleNumber, issue: 'Tire Condition Degrading', actionNeeded: 'Check Tire Pressure', severity: 'medium' });
      }
      if (vehicle.batteryHealth < 35) {
        alertsList.push({ id: `${vehicle.id}-bat-c`, vehicleNumber: vehicle.vehicleNumber, issue: 'Battery Weak', actionNeeded: 'Replace Battery', severity: 'high' });
      } else if (vehicle.batteryHealth < 50) {
        alertsList.push({ id: `${vehicle.id}-bat-w`, vehicleNumber: vehicle.vehicleNumber, issue: 'Battery Health Low', actionNeeded: 'Plan Battery Replacement', severity: 'medium' });
      }
      if (vehicle.fuelLevel < 30) {
        alertsList.push({ id: `${vehicle.id}-fuel-c`, vehicleNumber: vehicle.vehicleNumber, issue: 'Fuel Level Low', actionNeeded: 'Refuel Vehicle', severity: 'medium' });
      } else if (vehicle.fuelLevel < 50) {
        alertsList.push({ id: `${vehicle.id}-fuel-w`, vehicleNumber: vehicle.vehicleNumber, issue: 'Fuel Level Moderate', actionNeeded: 'Plan Refueling', severity: 'medium' });
      }
      if (vehicle.speed > 100) {
        alertsList.push({ id: `${vehicle.id}-spd-c`, vehicleNumber: vehicle.vehicleNumber, issue: 'Overspeed Warning', actionNeeded: 'Notify Driver', severity: 'high' });
      } else if (vehicle.speed > 80) {
        alertsList.push({ id: `${vehicle.id}-spd-w`, vehicleNumber: vehicle.vehicleNumber, issue: 'High Speed Detected', actionNeeded: 'Monitor Driver', severity: 'medium' });
      }
      if (vehicle.mileage > 15000) {
        alertsList.push({ id: `${vehicle.id}-mil-c`, vehicleNumber: vehicle.vehicleNumber, issue: 'Mileage Critical', actionNeeded: 'Schedule Maintenance', severity: 'high' });
      } else if (vehicle.mileage > 12000) {
        alertsList.push({ id: `${vehicle.id}-mil-w`, vehicleNumber: vehicle.vehicleNumber, issue: 'Mileage Due Soon', actionNeeded: 'Schedule Maintenance', severity: 'medium' });
      }
      if (Math.random() > 0.75) {
        alertsList.push({ id: `${vehicle.id}-brk`, vehicleNumber: vehicle.vehicleNumber, issue: 'Brake Wear High', actionNeeded: 'Schedule Brake Inspection', severity: 'medium' });
      }
      if (Math.random() > 0.8) {
        alertsList.push({ id: `${vehicle.id}-oil`, vehicleNumber: vehicle.vehicleNumber, issue: 'Oil Change Due', actionNeeded: 'Schedule Oil Service', severity: 'medium' });
      }
    });
    return alertsList;
  };

  const generateMaintenancePredictions = (vehiclesList) => {
    return vehiclesList.map(vehicle => ({
      id: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      lastServiceDate: vehicle.lastServiceDate,
      nextServiceDate: vehicle.nextServiceDate,
      status: vehicle.maintenanceStatus || 'Healthy',
      mileage: vehicle.mileage
    }));
  };

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const vehicleResponse = await fetch('http://localhost:8082/api/vehicles/test', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!vehicleResponse.ok) throw new Error('Failed to fetch vehicles');
      const vehiclesData = await vehicleResponse.json();

      const enrichedVehicles = vehiclesData.map((vehicle) => {
        const lastServiceDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
        const nextServiceDate = new Date(lastServiceDate.getTime() + 90 * 24 * 60 * 60 * 1000);
        const rand = Math.random();
        let mileage;
        if (rand < 0.60) mileage = Math.floor(Math.random() * 7000) + 5000;
        else if (rand < 0.85) mileage = Math.floor(Math.random() * 3000) + 12000;
        else mileage = Math.floor(Math.random() * 5000) + 15000;

        return {
          ...vehicle,
          engineHealth: Math.floor(Math.random() * 40) + 60,
          tireCondition: Math.floor(Math.random() * 60) + 40,
          fuelLevel: Math.floor(Math.random() * 70) + 30,
          batteryHealth: Math.floor(Math.random() * 60) + 40,
          speed: Math.floor(Math.random() * 60) + 60,
          mileage,
          lastServiceDate: lastServiceDate.toISOString().split('T')[0],
          nextServiceDate: nextServiceDate.toISOString().split('T')[0],
          maintenanceStatus: getMaintenanceStatus(mileage)
        };
      });

      setVehicles(enrichedVehicles);
      setAlerts(generateAlerts(enrichedVehicles));
      setMaintenancePredictions(generateMaintenancePredictions(enrichedVehicles));
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
      setError('Failed to load vehicle data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy': return '#10b981';
      case 'Due Soon': return '#f59e0b';
      case 'Critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading && vehicles.length === 0) {
    return <div className="maintenance-dashboard-loading">Loading vehicle data...</div>;
  }

  return (
    <div className="maintenance-dashboard">
      <div className="dashboard-header">
        <h2>🔧 Maintenance Monitoring Dashboard</h2>
        <button className="refresh-btn" onClick={fetchVehicleData}>🔄 Refresh</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Alert Monitoring Table */}
      <div className="dashboard-section">
        <h3>⚠️ Alert Monitoring ({alerts.length} Active)</h3>
        {alerts.length === 0 ? (
          <div className="no-alerts">✅ All vehicles are operating normally</div>
        ) : (
          <div className="table-wrapper">
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>Issue</th>
                  <th>Action Needed</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alert => (
                  <tr key={alert.id} className={`severity-${alert.severity}`}>
                    <td className="vehicle-id">{alert.vehicleNumber}</td>
                    <td className="issue-cell">{alert.issue}</td>
                    <td className="action-cell">{alert.actionNeeded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Maintenance Prediction Table */}
      <div className="dashboard-section">
        <h3>📅 Maintenance Prediction</h3>
        {maintenancePredictions.length === 0 ? (
          <div className="no-data">No vehicles available</div>
        ) : (
          <div className="table-wrapper">
            <table className="maintenance-table">
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>Last Service</th>
                  <th>Predicted Next Service</th>
                  <th>Status</th>
                  <th>Mileage</th>
                </tr>
              </thead>
              <tbody>
                {maintenancePredictions.map(prediction => (
                  <tr key={prediction.id} className={`status-${(prediction.status || 'healthy').toLowerCase().replace(/ /g, '-')}`}>
                    <td className="vehicle-id">{prediction.vehicleNumber}</td>
                    <td className="date-cell">{new Date(prediction.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="date-cell">{new Date(prediction.nextServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(prediction.status) }}>
                        {prediction.status}
                      </span>
                    </td>
                    <td className="mileage-cell">{prediction.mileage} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
