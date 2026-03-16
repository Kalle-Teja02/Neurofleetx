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
    const interval = setInterval(fetchVehicleData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch vehicles
      const vehicleResponse = await fetch('http://localhost:8082/api/vehicles/test', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!vehicleResponse.ok) throw new Error('Failed to fetch vehicles');
      
      const vehiclesData = await vehicleResponse.json();
      console.log('📊 Total vehicles fetched:', vehiclesData.length);
      
      // Enrich vehicles with simulated sensor data and maintenance dates
      // Distribute mileage to create realistic status distribution
      const enrichedVehicles = vehiclesData.map((vehicle, index) => {
        const lastServiceDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
        const nextServiceDate = new Date(lastServiceDate.getTime() + 90 * 24 * 60 * 60 * 1000);
        
        // Distribute mileage: 60% Healthy, 25% Due Soon, 15% Critical
        let mileage;
        const rand = Math.random();
        if (rand < 0.60) {
          // Healthy: < 12,000 km
          mileage = Math.floor(Math.random() * 12000) + 5000;
        } else if (rand < 0.85) {
          // Due Soon: 12,000-15,000 km
          mileage = Math.floor(Math.random() * 3000) + 12000;
        } else {
          // Critical: > 15,000 km
          mileage = Math.floor(Math.random() * 5000) + 15000;
        }
        
        return {
          ...vehicle,
          engineHealth: Math.floor(Math.random() * 40) + 60, // 60-100
          tireCondition: Math.floor(Math.random() * 60) + 40, // 40-100
          fuelLevel: Math.floor(Math.random() * 70) + 30, // 30-100
          batteryHealth: Math.floor(Math.random() * 60) + 40, // 40-100
          speed: Math.floor(Math.random() * 60) + 60, // 60-120
          mileage: mileage,
          lastServiceDate: lastServiceDate.toISOString().split('T')[0],
          nextServiceDate: nextServiceDate.toISOString().split('T')[0],
          maintenanceStatus: getMaintenanceStatus(mileage)
        };
      });
      
      setVehicles(enrichedVehicles);
      console.log('✅ Enriched vehicles:', enrichedVehicles.length);
      
      // Generate alerts based on new rules
      const generatedAlerts = generateAlerts(enrichedVehicles);
      setAlerts(generatedAlerts);
      console.log('⚠️ Generated alerts:', generatedAlerts.length);
      
      // Generate maintenance predictions
      const predictions = generateMaintenancePredictions(enrichedVehicles);
      setMaintenancePredictions(predictions);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
      setError('Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  };

  const getMaintenanceStatus = (mileage) => {
    if (mileage < 12000) return 'Healthy';
    if (mileage >= 12000 && mileage <= 15000) return 'Due Soon';
    return 'Critical';
  };

  const generateAlerts = (vehiclesList) => {
    const alertsList = [];
    
    vehiclesList.forEach(vehicle => {
      // Overspeed alert (speed > 100 km/h)
      if (vehicle.speed > 100) {
        alertsList.push({
          id: `${vehicle.id}-speed`,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          issue: 'Overspeed Warning',
          actionNeeded: 'Notify Driver',
          severity: 'high'
        });
      }
      
      // Tire alert (tireCondition < 40)
      if (vehicle.tireCondition < 40) {
        alertsList.push({
          id: `${vehicle.id}-tire`,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          issue: 'Tire Pressure Low',
          actionNeeded: 'Inflate Tire',
          severity: 'high'
        });
      }

      // Battery alert (batteryHealth < 35)
      if (vehicle.batteryHealth < 35) {
        alertsList.push({
          id: `${vehicle.id}-battery`,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          issue: 'Battery Weak',
          actionNeeded: 'Replace Battery',
          severity: 'high'
        });
      }

      // Engine alert (engineHealth < 50)
      if (vehicle.engineHealth < 50) {
        alertsList.push({
          id: `${vehicle.id}-engine`,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          issue: 'Engine Overheat',
          actionNeeded: 'Service Engine',
          severity: 'high'
        });
      }
    });
    
    return alertsList;
  };

  const generateMaintenancePredictions = (vehiclesList) => {
    return vehiclesList.map(vehicle => ({
      id: vehicle.id,
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      lastServiceDate: vehicle.lastServiceDate,
      nextServiceDate: vehicle.nextServiceDate,
      status: vehicle.maintenanceStatus,
      mileage: vehicle.mileage
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
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
                  <tr key={prediction.id} className={`status-${prediction.status.toLowerCase().replace(' ', '-')}`}>
                    <td className="vehicle-id">{prediction.vehicleNumber}</td>
                    <td className="date-cell">{new Date(prediction.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="date-cell">{new Date(prediction.nextServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(prediction.status) }}
                      >
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
