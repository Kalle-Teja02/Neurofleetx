import React from 'react';
import '../styles/vehicleDetailsModal.css';

const VehicleDetailsModal = ({ vehicle, driverName, tripInfo, onClose }) => {
  if (!vehicle) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚗 Vehicle Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="details-section">
            <h3>📋 Basic Information</h3>
            <div className="detail-row">
              <span className="label">Vehicle ID:</span>
              <span className="value">{vehicle.id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Vehicle Number:</span>
              <span className="value">{vehicle.vehicleNumber}</span>
            </div>
            <div className="detail-row">
              <span className="label">Model:</span>
              <span className="value">{vehicle.model}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className={`status-badge ${vehicle.status?.toLowerCase()}`}>
                {vehicle.status}
              </span>
            </div>
          </div>

          <div className="details-section">
            <h3>👤 Assignment</h3>
            <div className="detail-row">
              <span className="label">Assigned Driver:</span>
              <span className="value">{driverName}</span>
            </div>
            <div className="detail-row">
              <span className="label">Fleet Manager ID:</span>
              <span className="value">{vehicle.fleetManagerId}</span>
            </div>
          </div>

          <div className="details-section">
            <h3>📍 Telemetry</h3>
            <div className="detail-row">
              <span className="label">Location:</span>
              <span className="value">
                {vehicle.latitude?.toFixed(6)}, {vehicle.longitude?.toFixed(6)}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Speed:</span>
              <span className="value">{vehicle.speed?.toFixed(1)} km/h</span>
            </div>
            <div className="detail-row">
              <span className="label">Battery:</span>
              <div className="progress-bar-small">
                <div 
                  className="progress-fill-small battery" 
                  style={{ width: `${vehicle.batteryPercentage}%` }}
                >
                  {vehicle.batteryPercentage}%
                </div>
              </div>
            </div>
            <div className="detail-row">
              <span className="label">Fuel:</span>
              <div className="progress-bar-small">
                <div 
                  className="progress-fill-small fuel" 
                  style={{ width: `${vehicle.fuelPercentage}%` }}
                >
                  {vehicle.fuelPercentage}%
                </div>
              </div>
            </div>
            <div className="detail-row">
              <span className="label">Last Updated:</span>
              <span className="value">
                {vehicle.lastUpdatedTime 
                  ? new Date(vehicle.lastUpdatedTime).toLocaleString() 
                  : 'N/A'}
              </span>
            </div>
          </div>

          {tripInfo && (
            <div className="details-section trip-section">
              <h3>🚦 Active Trip</h3>
              <div className="detail-row">
                <span className="label">Trip ID:</span>
                <span className="value">{tripInfo.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Start Time:</span>
                <span className="value">
                  {new Date(tripInfo.startTime).toLocaleString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Duration:</span>
                <span className="value trip-duration">{tripInfo.duration}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-modal-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsModal;
