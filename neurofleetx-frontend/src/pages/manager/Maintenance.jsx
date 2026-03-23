import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MaintenanceStatusPie from "../../components/MaintenanceStatusPie";
import AlertNotifications from "../../components/AlertNotifications";
import VehicleWearChart from "../../components/VehicleWearChart";
import FleetVehicleParameters from "../../components/FleetVehicleParameters";
import "../../styles/pages.css";
import "../../styles/maintenancePage.css";

function Maintenance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('alerts');

  const tabs = [
    { key: 'alerts',     label: '🚨 Alerts' },
    { key: 'status',     label: '🔧 Status Overview' },
    { key: 'parameters', label: '📊 Vehicle Parameters' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
        <h1>Maintenance Management</h1>
      </div>

      <div className="maintenance-tabs">
        <div className="tabs-header">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tabs-content">
          {activeTab === 'alerts' && (
            <div className="tab-pane"><AlertNotifications /></div>
          )}
          {activeTab === 'status' && (
            <div className="tab-pane">
              <div className="status-overview-grid">
                <MaintenanceStatusPie />
                <VehicleWearChart />
              </div>
            </div>
          )}
          {activeTab === 'parameters' && (
            <div className="tab-pane"><FleetVehicleParameters /></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Maintenance;
