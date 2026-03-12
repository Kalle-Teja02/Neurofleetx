import React, { useState, useCallback } from 'react';
import AddVehicleForm from '../components/AddVehicleForm';
import VehicleDashboard from '../components/VehicleDashboard';
import { useNavigate } from 'react-router-dom';
import '../styles/fleetInventoryPage.css';

const FleetInventoryPage = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleVehicleAdded = useCallback(() => {
    console.log('🔄 Vehicle added, forcing refresh... Current key:', refreshKey);
    const newKey = Date.now(); // Use timestamp for guaranteed uniqueness
    setRefreshKey(newKey);
    console.log('✅ New refresh key:', newKey);
  }, [refreshKey]);

  return (
    <div className="fleet-inventory-page">
      <div className="page-header">
        <button onClick={() => navigate('/manager')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Fleet Inventory & Vehicle Telemetry</h1>
      </div>

      <div className="page-content">
        <AddVehicleForm onVehicleAdded={handleVehicleAdded} />
        <VehicleDashboard refreshTrigger={refreshKey} />
      </div>
    </div>
  );
};

export default FleetInventoryPage;
