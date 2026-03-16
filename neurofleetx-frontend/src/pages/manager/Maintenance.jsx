import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MaintenanceDashboard from "../../components/MaintenanceDashboard";
import MaintenanceStatusPie from "../../components/MaintenanceStatusPie";
import "../../styles/pages.css";

function Maintenance() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
        <h1>Maintenance Management</h1>
      </div>

      <div style={{ padding: '20px' }}>
        <MaintenanceStatusPie />
        <MaintenanceDashboard />
      </div>
    </div>
  );
}

export default Maintenance;
