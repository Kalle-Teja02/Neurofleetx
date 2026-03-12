import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/pages.css";

function Maintenance() {
  const navigate = useNavigate();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const response = await axios.get('http://localhost:8082/api/maintenance/manager/test');
      setMaintenanceRecords(response.data);
      console.log("✅ Loaded", response.data.length, "maintenance records");
    } catch (error) {
      console.error("❌ Error loading maintenance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
    alert(`Maintenance Details:\n\nID: ${record.id}\nVehicle: ${record.vehicleNumber}\nType: ${record.type}\nDate: ${new Date(record.scheduledDate).toLocaleDateString()}\nStatus: ${record.status}\nCost: ₹${record.cost}\nDescription: ${record.description}`);
  };

  const handleScheduleMaintenance = () => {
    const type = prompt("Enter maintenance type (e.g., Oil Change, Tire Rotation):");
    if (type) {
      alert(`Maintenance "${type}" will be scheduled.\n\n(Backend endpoint not yet implemented)`);
      // TODO: Call POST /api/maintenance/manager/test
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
          <h1>Maintenance Management</h1>
        </div>
        <div className="empty-state">
          <p>Loading maintenance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
        <h1>Maintenance Management</h1>
        <button className="primary-btn" onClick={handleScheduleMaintenance}>Schedule Maintenance</button>
      </div>

      <div className="table-card">
        {maintenanceRecords.length === 0 ? (
          <div className="empty-state">
            <p>No maintenance records found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle Number</th>
                <th>Type</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.vehicleNumber}</td>
                  <td>{record.type}</td>
                  <td>{new Date(record.scheduledDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>₹{record.cost.toLocaleString()}</td>
                  <td><button className="view-btn" onClick={() => handleView(record)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Maintenance;
