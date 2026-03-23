import { useState, useEffect } from 'react';
import '../styles/alertNotifications.css';

export default function AlertNotifications() {
  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  useEffect(() => {
    fetchAlertsData();
    const interval = setInterval(fetchAlertsData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAlertsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch vehicles
      const vehicleResponse = await fetch('http://localhost:8082/api/vehicles/test', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!vehicleResponse.ok) throw new Error('Failed to fetch vehicles');
      
      const vehiclesData = await vehicleResponse.json();
      
      // Enrich with sensor data
      const enrichedVehicles = vehiclesData.map((vehicle) => {
        const lastServiceDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
        const nextServiceDate = new Date(lastServiceDate.getTime() + 90 * 24 * 60 * 60 * 1000);
        
        let mileage;
        const rand = Math.random();
        if (rand < 0.60) {
          mileage = Math.floor(Math.random() * 12000) + 5000;
        } else if (rand < 0.85) {
          mileage = Math.floor(Math.random() * 3000) + 12000;
        } else {
          mileage = Math.floor(Math.random() * 5000) + 15000;
        }
        
        return {
          ...vehicle,
          engineHealth: Math.floor(Math.random() * 40) + 60,
          tireCondition: Math.floor(Math.random() * 60) + 40,
          fuelLevel: Math.floor(Math.random() * 70) + 30,
          batteryHealth: Math.floor(Math.random() * 60) + 40,
          speed: Math.floor(Math.random() * 60) + 60,
          mileage: mileage,
          lastServiceDate: lastServiceDate.toISOString().split('T')[0],
          nextServiceDate: nextServiceDate.toISOString().split('T')[0],
        };
      });
      
      setVehicles(enrichedVehicles);
      
      // Generate alerts
      const generatedAlerts = generateDetailedAlerts(enrichedVehicles);
      setAlerts(generatedAlerts);
    } catch (err) {
      console.error('Error fetching alerts data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateDetailedAlerts = (vehiclesList) => {
    const alertsList = [];
    let alertId = 0;

    vehiclesList.forEach(vehicle => {
      // Engine Health Alert
      if (vehicle.engineHealth < 50) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'engine',
          factor: 'Engine Health',
          value: `${vehicle.engineHealth}%`,
          threshold: '< 50%',
          severity: 'critical',
          message: `Engine health critically low at ${vehicle.engineHealth}%`,
          action: 'Schedule immediate engine service',
          icon: '⚙️'
        });
      } else if (vehicle.engineHealth < 70) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'engine',
          factor: 'Engine Health',
          value: `${vehicle.engineHealth}%`,
          threshold: '< 70%',
          severity: 'warning',
          message: `Engine health degrading at ${vehicle.engineHealth}%`,
          action: 'Monitor engine performance',
          icon: '⚙️'
        });
      }

      // Tire Condition Alert
      if (vehicle.tireCondition < 40) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'tire',
          factor: 'Tire Condition',
          value: `${vehicle.tireCondition}%`,
          threshold: '< 40%',
          severity: 'critical',
          message: `Tire pressure critically low at ${vehicle.tireCondition}%`,
          action: 'Inflate tires immediately',
          icon: '🛞'
        });
      } else if (vehicle.tireCondition < 60) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'tire',
          factor: 'Tire Condition',
          value: `${vehicle.tireCondition}%`,
          threshold: '< 60%',
          severity: 'warning',
          message: `Tire condition degrading at ${vehicle.tireCondition}%`,
          action: 'Check tire pressure soon',
          icon: '🛞'
        });
      }

      // Battery Health Alert
      if (vehicle.batteryHealth < 35) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'battery',
          factor: 'Battery Health',
          value: `${vehicle.batteryHealth}%`,
          threshold: '< 35%',
          severity: 'critical',
          message: `Battery health critically low at ${vehicle.batteryHealth}%`,
          action: 'Replace battery immediately',
          icon: '🔋'
        });
      } else if (vehicle.batteryHealth < 50) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'battery',
          factor: 'Battery Health',
          value: `${vehicle.batteryHealth}%`,
          threshold: '< 50%',
          severity: 'warning',
          message: `Battery health degrading at ${vehicle.batteryHealth}%`,
          action: 'Plan battery replacement',
          icon: '🔋'
        });
      }

      // Fuel Level Alert
      if (vehicle.fuelLevel < 30) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'fuel',
          factor: 'Fuel Level',
          value: `${vehicle.fuelLevel}%`,
          threshold: '< 30%',
          severity: 'warning',
          message: `Fuel level low at ${vehicle.fuelLevel}%`,
          action: 'Refuel vehicle soon',
          icon: '⛽'
        });
      } else if (vehicle.fuelLevel < 50) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'fuel',
          factor: 'Fuel Level',
          value: `${vehicle.fuelLevel}%`,
          threshold: '< 50%',
          severity: 'warning',
          message: `Fuel level moderate at ${vehicle.fuelLevel}%`,
          action: 'Plan refueling soon',
          icon: '⛽'
        });
      }

      // Speed Alert
      if (vehicle.speed > 100) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'speed',
          factor: 'Overspeed',
          value: `${vehicle.speed} km/h`,
          threshold: '> 100 km/h',
          severity: 'critical',
          message: `Vehicle exceeding speed limit at ${vehicle.speed} km/h`,
          action: 'Notify driver to reduce speed',
          icon: '⚡'
        });
      } else if (vehicle.speed > 80) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'speed',
          factor: 'High Speed',
          value: `${vehicle.speed} km/h`,
          threshold: '> 80 km/h',
          severity: 'warning',
          message: `Vehicle traveling at high speed ${vehicle.speed} km/h`,
          action: 'Monitor driver behavior',
          icon: '⚡'
        });
      }

      // Idle Time Alert (simulated)
      const idleChance = Math.random();
      if (idleChance > 0.7) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'idle',
          factor: 'Excessive Idle Time',
          value: `${Math.floor(Math.random() * 30) + 15} min`,
          threshold: '> 15 min',
          severity: 'warning',
          message: `Vehicle idle time exceeding threshold`,
          action: 'Check vehicle status and driver',
          icon: '⏸️'
        });
      }

      // Maintenance Overdue Alert (simulated)
      const maintenanceChance = Math.random();
      if (maintenanceChance > 0.75) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'maintenance',
          factor: 'Maintenance Overdue',
          value: `${Math.floor(Math.random() * 20) + 5} days`,
          threshold: '> 0 days',
          severity: 'warning',
          message: `Vehicle maintenance is overdue`,
          action: 'Schedule maintenance appointment',
          icon: '🔧'
        });
      }

      // Brake Wear Alert (simulated)
      const brakeWear = Math.floor(Math.random() * 100);
      if (brakeWear > 75) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'brake',
          factor: 'Brake Wear',
          value: `${brakeWear}%`,
          threshold: '> 75%',
          severity: 'warning',
          message: `Brake wear level at ${brakeWear}%`,
          action: 'Schedule brake inspection',
          icon: '🛑'
        });
      }

      // Oil Change Due Alert (simulated)
      const oilChangeChance = Math.random();
      if (oilChangeChance > 0.8) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'oil',
          factor: 'Oil Change Due',
          value: `${Math.floor(Math.random() * 500) + 100} km`,
          threshold: '> 5000 km',
          severity: 'warning',
          message: `Vehicle oil change is due soon`,
          action: 'Schedule oil change service',
          icon: '🛢️'
        });
      }

      // Mileage Alert
      if (vehicle.mileage > 15000) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'mileage',
          factor: 'High Mileage',
          value: `${vehicle.mileage} km`,
          threshold: '> 15,000 km',
          severity: 'critical',
          message: `Vehicle mileage critical at ${vehicle.mileage} km`,
          action: 'Schedule maintenance immediately',
          icon: '📍'
        });
      } else if (vehicle.mileage > 12000) {
        alertsList.push({
          id: alertId++,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          type: 'mileage',
          factor: 'Mileage Due Soon',
          value: `${vehicle.mileage} km`,
          threshold: '12,000-15,000 km',
          severity: 'warning',
          message: `Vehicle mileage approaching service interval at ${vehicle.mileage} km`,
          action: 'Schedule maintenance soon',
          icon: '📍'
        });
      }
    });

    return alertsList;
  };

  const dismissAlert = (alertId) => {
    setDismissedAlerts(new Set([...dismissedAlerts, alertId]));
  };

  const activAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));
  const criticalAlerts = activAlerts.filter(a => a.severity === 'critical');
  const warningAlerts = activAlerts.filter(a => a.severity === 'warning');
  const criticalCount = criticalAlerts.length;
  const warningCount = warningAlerts.length;
  const uniqueVehicleCount = new Set(activAlerts.map(a => a.vehicleId)).size;

  if (loading && vehicles.length === 0) {
    return <div className="alerts-loading">Loading alerts...</div>;
  }

  return (
    <div className="alert-notifications-container">
      <div className="alerts-header">
        <h2>🚨 Alert Notifications</h2>
        <div className="alert-stats">
          <span className="stat critical">🔴 Critical: {criticalCount}</span>
          <span className="stat warning">🟡 Warning: {warningCount}</span>
          <span className="stat info">ℹ️ Total Alerts: {activAlerts.length}</span>
          <span className="stat info">🚗 Vehicles with Alerts: {uniqueVehicleCount}</span>
        </div>
        <button className="clear-all-btn" onClick={() => setDismissedAlerts(new Set(alerts.map(a => a.id)))}>✕ Clear All</button>
        <button className="refresh-btn" onClick={fetchAlertsData}>🔄 Refresh</button>
      </div>

      {activAlerts.length === 0 ? (
        <div className="no-alerts-message">
          ✅ All systems operating normally. No alerts at this time.
        </div>
      ) : (
        <div className="alerts-two-col">
          <div className="alerts-col">
            <div className="alerts-col-header critical">🔴 Critical ({criticalCount})</div>
            <div className="alerts-col-scroll">
              {criticalAlerts.length === 0 ? (
                <div className="col-empty">No critical alerts</div>
              ) : criticalAlerts.map(alert => (
                <div key={alert.id} className="alert-card-item sev-critical">
                  <div className="alert-card-top">
                    <span className="alert-alarm-icon">🔔</span>
                    <div className="alert-card-info">
                      <p className="alert-card-vehicle">{alert.icon} {alert.vehicleNumber}</p>
                      <p className="alert-card-factor">{alert.factor}</p>
                    </div>
                    <span className="alert-sev-label critical">CRITICAL</span>
                  </div>
                  <div className="alert-card-meta">
                    ⏱ <span className="alert-card-value">{alert.value}</span> · Threshold: {alert.threshold}
                  </div>
                  <div className="alert-card-bottom">
                    <button className="alert-card-action-btn critical">{alert.action}</button>
                    <button className="dismiss-icon-btn" onClick={() => dismissAlert(alert.id)} title="Dismiss">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="alerts-col">
            <div className="alerts-col-header warning">🟡 Warnings ({warningCount})</div>
            <div className="alerts-col-scroll">
              {warningAlerts.length === 0 ? (
                <div className="col-empty">No warnings</div>
              ) : warningAlerts.map(alert => (
                <div key={alert.id} className="alert-card-item sev-warning">
                  <div className="alert-card-top">
                    <span className="alert-alarm-icon">🔔</span>
                    <div className="alert-card-info">
                      <p className="alert-card-vehicle">{alert.icon} {alert.vehicleNumber}</p>
                      <p className="alert-card-factor">{alert.factor}</p>
                    </div>
                    <span className="alert-sev-label warning">WARNING</span>
                  </div>
                  <div className="alert-card-meta">
                    ⏱ <span className="alert-card-value">{alert.value}</span> · Threshold: {alert.threshold}
                  </div>
                  <div className="alert-card-bottom">
                    <button className="alert-card-action-btn warning">{alert.action}</button>
                    <button className="dismiss-icon-btn" onClick={() => dismissAlert(alert.id)} title="Dismiss">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
