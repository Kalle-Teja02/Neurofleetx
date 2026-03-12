import React from 'react';
import '../styles/vehicleCard.css';

const VehicleCard = ({ vehicle, onDelete, onEdit, onServiceComplete, driverName, tripInfo }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return '#22c55e';
      case 'IN_USE':
        return '#eab308';
      case 'MAINTENANCE':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const calculateDuration = (startTime) => {
    if (!startTime) return '0 min';
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete vehicle ${vehicle.vehicleNumber}?`)) {
      onDelete(vehicle.id);
    }
  };

  return (
    <div className={`vehicle-card ${vehicle.status === 'MAINTENANCE' ? 'maintenance-alert' : ''}`}>
      <div className="vehicle-header">
        <h3>{vehicle.vehicleNumber}</h3>
        <span 
          className="status-chip" 
          style={{ backgroundColor: getStatusColor(vehicle.status) }}
        >
          {vehicle.status}
        </span>
      </div>

      <div className="vehicle-info">
        <p className="model">🚗 {vehicle.model}</p>
        
        {driverName && (
          <div className="telemetry-row">
            <div className="telemetry-item">
              <span className="icon">👤</span>
              <span className="label">Driver:</span>
              <span className="value driver-name">{driverName}</span>
            </div>
          </div>
        )}
        
        {tripInfo && tripInfo.status === 'ACTIVE' && (
          <>
            <div className="telemetry-row">
              <div className="telemetry-item">
                <span className="icon">🚦</span>
                <span className="label">Trip Status:</span>
                <span className="value trip-active">ACTIVE</span>
              </div>
            </div>
            <div className="telemetry-row">
              <div className="telemetry-item">
                <span className="icon">⏱️</span>
                <span className="label">Start Time:</span>
                <span className="value">{new Date(tripInfo.startTime).toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="telemetry-row">
              <div className="telemetry-item">
                <span className="icon">⏳</span>
                <span className="label">Duration:</span>
                <span className="value trip-duration">{calculateDuration(tripInfo.startTime)}</span>
              </div>
            </div>
          </>
        )}
        
        <div className="telemetry-row">
          <div className="telemetry-item">
            <span className="icon">📍</span>
            <span className="label">Location:</span>
            <span className="value">
              {vehicle.latitude?.toFixed(4)}, {vehicle.longitude?.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="telemetry-row">
          <div className="telemetry-item">
            <span className="icon">⚡</span>
            <span className="label">Speed:</span>
            <span className="value">
              {vehicle.speed ? `${vehicle.speed.toFixed(1)} km/h` : '0 km/h'}
            </span>
          </div>
        </div>

        <div className="telemetry-row">
          <div className="telemetry-item">
            <span className="icon">🔋</span>
            <span className="label">Battery:</span>
            <div className="progress-bar">
              <div 
                className="progress-fill battery" 
                style={{ width: `${vehicle.batteryPercentage}%` }}
              >
                {vehicle.batteryPercentage}%
              </div>
            </div>
          </div>
        </div>

        <div className="telemetry-row">
          <div className="telemetry-item">
            <span className="icon">⛽</span>
            <span className="label">Fuel:</span>
            <div className="progress-bar">
              <div 
                className="progress-fill fuel" 
                style={{ width: `${vehicle.fuelPercentage}%` }}
              >
                {vehicle.fuelPercentage}%
              </div>
            </div>
          </div>
        </div>

        {vehicle.lastUpdatedTime && (
          <div className="last-updated">
            <span className="icon">🕒</span>
            <span className="time">{new Date(vehicle.lastUpdatedTime).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="card-actions">
        {vehicle.status === 'MAINTENANCE' ? (
          <button 
            className="service-btn" 
            onClick={() => onServiceComplete(vehicle.id)}
          >
            ✅ Mark as Serviced
          </button>
        ) : (
          <>
            <button 
              className="edit-btn" 
              onClick={() => onEdit(vehicle)}
            >
              ✏️ Edit
            </button>
            <button 
              className="delete-btn" 
              onClick={handleDelete}
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
