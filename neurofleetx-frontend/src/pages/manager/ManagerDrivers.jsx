import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/pages.css";

function ManagerDrivers() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchDrivers(), fetchVehicles()]);
    } catch (error) {
      console.error("❌ Error loading data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get('http://localhost:8082/api/drivers/manager/test');
      const data = response.data;
      
      if (Array.isArray(data)) {
        setDrivers(data);
        console.log("✅ Loaded", data.length, "drivers");
      } else {
        console.error("❌ Drivers API returned non-array:", data);
        setDrivers([]);
      }
    } catch (error) {
      console.error("❌ Error loading drivers:", error);
      setDrivers([]);
      throw error;
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:8082/api/vehicles/manager/test');
      const data = response.data;
      
      if (Array.isArray(data)) {
        setVehicles(data);
        console.log("✅ Loaded", data.length, "vehicles");
      } else {
        console.error("❌ Vehicles API returned non-array:", data);
        setVehicles([]);
      }
    } catch (error) {
      console.error("❌ Error loading vehicles:", error);
      setVehicles([]);
      throw error;
    }
  };

  const handleView = (driver) => {
    if (!driver) return;
    
    const assignedVehicle = driver.vehicleId 
      ? vehicles?.find(v => v?.id === driver.vehicleId)?.vehicleNumber || `Vehicle ID: ${driver.vehicleId}`
      : 'Not assigned';
    
    alert(`Driver Details:\n\nID: ${driver.id}\nName: ${driver.name}\nEmail: ${driver.email}\nPhone: ${driver.phone || 'N/A'}\nLicense: ${driver.license || 'N/A'}\nAssigned Vehicle: ${assignedVehicle}\nStatus: ${driver.active ? 'Active' : 'Inactive'}`);
  };

  const handleAssignDriver = () => {
    if (!drivers || drivers.length === 0) {
      alert("No drivers available. Please wait for data to load.");
      return;
    }
    if (!vehicles || vehicles.length === 0) {
      alert("No vehicles available. Please wait for data to load.");
      return;
    }
    
    setShowAssignModal(true);
    setSelectedDriver("");
    setSelectedVehicle("");
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDriver || !selectedVehicle) {
      alert("Please select both a driver and a vehicle");
      return;
    }

    setAssigning(true);
    
    try {
      const response = await axios.put(
        `http://localhost:8082/api/drivers/manager/test/${selectedDriver}/assign/${selectedVehicle}`
      );
      
      console.log("✅ Assignment successful:", response.data);
      alert(`Success!\n\n${response.data}`);
      
      setShowAssignModal(false);
      fetchDrivers();
    } catch (error) {
      console.error("❌ Error assigning driver:", error);
      alert("Failed to assign driver. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
          <h1>Driver Management</h1>
        </div>
        <div className="empty-state">
          <p>Loading drivers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
          <h1>Driver Management</h1>
        </div>
        <div className="empty-state">
          <p style={{color: 'red'}}>{error}</p>
          <button onClick={fetchData} className="primary-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
        <h1>Driver Management</h1>
        <button className="primary-btn" onClick={handleAssignDriver}>Assign Driver</button>
      </div>

      <div className="table-card">
        {!drivers || drivers.length === 0 ? (
          <div className="empty-state">
            <p>No drivers found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Driver ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>License</th>
                <th>Assigned Vehicle</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers?.map((driver) => {
                const assignedVehicle = driver?.vehicleId 
                  ? vehicles?.find(v => v?.id === driver.vehicleId)?.vehicleNumber || `ID: ${driver.vehicleId}`
                  : 'Not assigned';
                
                return (
                  <tr key={driver?.id || Math.random()}>
                    <td>{driver?.id || 'N/A'}</td>
                    <td>{driver?.name || 'N/A'}</td>
                    <td>{driver?.email || 'N/A'}</td>
                    <td>{driver?.phone || 'N/A'}</td>
                    <td>{driver?.license || 'N/A'}</td>
                    <td>{assignedVehicle}</td>
                    <td>
                      <span className={`status-badge ${driver?.active ? 'active' : 'inactive'}`}>
                        {driver?.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td><button className="view-btn" onClick={() => handleView(driver)}>View</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Assign Driver to Vehicle</h2>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
              Drivers: {drivers?.length || 0} | Vehicles: {vehicles?.length || 0}
            </p>
            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label>Select Driver:</label>
                <select 
                  value={selectedDriver} 
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  required
                >
                  <option value="">-- Choose a driver --</option>
                  {drivers?.map(driver => (
                    <option key={driver?.id || Math.random()} value={driver?.id}>
                      {driver?.name || 'Unknown'} (ID: {driver?.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Vehicle:</label>
                <select 
                  value={selectedVehicle} 
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  required
                >
                  <option value="">-- Choose a vehicle --</option>
                  {vehicles?.map(vehicle => (
                    <option key={vehicle?.id || Math.random()} value={vehicle?.id}>
                      {vehicle?.vehicleNumber || 'Unknown'} (ID: {vehicle?.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowAssignModal(false)}
                  className="cancel-btn"
                  disabled={assigning}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-btn"
                  disabled={assigning}
                >
                  {assigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-content h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #555;
        }

        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .cancel-btn {
          padding: 0.75rem 1.5rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }

        .cancel-btn:hover {
          background: #f5f5f5;
        }

        .cancel-btn:disabled,
        .primary-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default ManagerDrivers;
