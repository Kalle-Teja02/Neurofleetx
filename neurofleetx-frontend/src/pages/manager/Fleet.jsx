import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { deleteVehicle } from "../../services/vehicleService";
import EditVehicleModal from "../../components/EditVehicleModal";
import VehicleDetailsModal from "../../components/VehicleDetailsModal";
import VehicleWearChart from "../../components/VehicleWearChart";
import "../../styles/pages.css";

function Fleet() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    console.log('📋 Drivers loaded:', drivers);
    console.log('📋 Drivers count:', drivers.length);
  }, [drivers]);

  useEffect(() => {
    console.log('🚗 Vehicles loaded:', vehicles);
    console.log('🚗 Vehicles count:', vehicles.length);
  }, [vehicles]);

  useEffect(() => {
    const loadData = async () => {
      console.log('⏳ Starting data load...');
      await fetchDrivers();
      await fetchVehicles();
      await fetchTrips();
      console.log('✅ Data load complete');
    };
    
    loadData();
    
    // Auto-refresh trips every 30 seconds to update duration
    const interval = setInterval(() => {
      fetchTrips();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [renderKey]);

  const fetchTrips = async () => {
    try {
      console.log('🔄 Fetching all trips from /api/trips/manager/test');
      const response = await fetch('http://localhost:8082/api/trips/manager/test');
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
        console.log("✅ Loaded", data.length, "total trips");
        console.log("📋 Trip details:", data);
        return data;
      } else {
        console.error("❌ Failed to fetch trips:", response.status);
        setTrips([]);
        return [];
      }
    } catch (error) {
      console.error("❌ Error loading trips:", error);
      setTrips([]);
      return [];
    }
  };

  const fetchDrivers = async () => {
    try {
      console.log('🔄 Fetching drivers from /api/drivers/manager/test');
      const response = await axios.get('http://localhost:8082/api/drivers/manager/test');
      console.log('📥 Response received:', response.data);
      setDrivers(response.data);
      console.log("✅ Loaded", response.data.length, "drivers");
      return response.data;
    } catch (error) {
      console.error("❌ Error loading drivers:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      setDrivers([]);
      return [];
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch ALL vehicles
      const timestamp = new Date().getTime();
      const response = await axios.get(`http://localhost:8082/api/vehicles/test?_=${timestamp}`);
      const data = response.data;
      
      // Ensure we have an array
      if (Array.isArray(data)) {
        setVehicles(data);
        console.log("✅ Loaded", data.length, "vehicles");
      } else {
        console.error("❌ API returned non-array:", data);
        setVehicles([]);
        setError("Invalid data format received from server");
      }
    } catch (error) {
      console.error("❌ Error loading vehicles:", error);
      setError("Failed to load vehicles. Please try again.");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (vehicle) => {
    if (!vehicle) return;
    
    // Fetch driver name if assigned
    let driverName = 'Not Assigned';
    if (vehicle.assignedDriverId) {
      const driver = drivers.find(d => d.id === vehicle.assignedDriverId);
      driverName = driver ? driver.name : `Driver ID: ${vehicle.assignedDriverId}`;
    }
    
    // Fetch active trip if exists
    let tripInfo = null;
    try {
      const response = await fetch(`http://localhost:8082/api/trips/test/driver/${vehicle.assignedDriverId}`);
      if (response.ok) {
        const trips = await response.json();
        const activeTrip = trips.find(t => t.status === 'ACTIVE' && t.vehicleId === vehicle.id);
        if (activeTrip) {
          const startTime = new Date(activeTrip.startTime);
          const now = new Date();
          const durationMs = now - startTime;
          const hours = Math.floor(durationMs / 3600000);
          const minutes = Math.floor((durationMs % 3600000) / 60000);
          
          tripInfo = {
            ...activeTrip,
            duration: `${hours}h ${minutes}m`
          };
        }
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
    }
    
    setViewingVehicle({ vehicle, driverName, tripInfo });
  };

  const handleAddVehicle = () => {
    const vehicleNumber = prompt("Enter Vehicle Number (e.g., TS09AB1234):");
    if (vehicleNumber) {
      alert(`Vehicle "${vehicleNumber}" will be added.\n\n(Backend endpoint not yet implemented)`);
    }
  };

  const handleDelete = (vehicle) => {
    if (!vehicle) return;
    if (confirm(`Are you sure you want to delete vehicle ${vehicle.vehicleNumber}?`)) {
      deleteVehicle(vehicle.id)
        .then(() => {
          alert(`Vehicle ${vehicle.vehicleNumber} deleted successfully!`);
          fetchVehicles();
        })
        .catch(error => {
          console.error('Error deleting vehicle:', error);
          alert('Failed to delete vehicle. Please try again.');
        });
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
  };

  const handleCloseModal = () => {
    setEditingVehicle(null);
  };

  const handleUpdateSuccess = () => {
    fetchVehicles();
  };

  const handleAssignDriver = async (vehicleId) => {
    if (drivers.length === 0) {
      alert('No drivers available');
      return;
    }

    // Create a formatted list of drivers
    const driverOptions = drivers.map(d => `${d.id}: ${d.name}`).join('\n');
    const driverId = prompt(`Select Driver ID:\n\n${driverOptions}\n\nEnter Driver ID:`);
    
    if (driverId && driverId.trim()) {
      try {
        console.log('🔄 Assigning driver', driverId, 'to vehicle', vehicleId);
        
        // Get the vehicle
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) {
          alert('Vehicle not found');
          return;
        }
        
        // Verify driver exists
        const selectedDriver = drivers.find(d => d.id === parseInt(driverId));
        if (!selectedDriver) {
          alert('Driver not found');
          return;
        }
        
        // Update with assigned driver
        const updatedVehicle = { 
          ...vehicle, 
          assignedDriverId: parseInt(driverId) 
        };
        
        console.log('📤 Sending update:', updatedVehicle);
        
        // Use direct fetch with no cache
        const response = await fetch(`http://localhost:8082/api/vehicles/test/${vehicleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(updatedVehicle)
        });
        
        if (!response.ok) {
          throw new Error('Failed to assign driver');
        }
        
        const savedVehicle = await response.json();
        console.log('✅ Driver assigned successfully, received:', savedVehicle);
        
        alert(`✅ Driver ${selectedDriver.name} assigned to vehicle ${vehicle.vehicleNumber}`);
        
        // Refresh vehicles
        fetchVehicles();
      } catch (error) {
        console.error('❌ Error assigning driver:', error);
        alert('Failed to assign driver: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
          <h1>Fleet Management</h1>
        </div>
        <div className="empty-state">
          <p>Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
          <h1>Fleet Management</h1>
        </div>
        <div className="empty-state">
          <p style={{color: 'red'}}>{error}</p>
          <button onClick={fetchVehicles} className="primary-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
        <h1>Fleet Management</h1>
        <div style={{display: 'flex', gap: '10px'}}>
          <button className="primary-btn" onClick={() => setRenderKey(prev => prev + 1)}>🔄 Refresh</button>
          <button className="primary-btn" onClick={handleAddVehicle}>Add Vehicle</button>
        </div>
      </div>

      {/* Charts & Analytics Section */}
      <div style={{marginBottom: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
        <h2 style={{marginTop: 0, marginBottom: '20px', color: '#333', fontSize: '1.5rem'}}>📊 Vehicle Wear Analysis</h2>
        <VehicleWearChart />
      </div>

      <div className="table-card">
        {!vehicles || vehicles.length === 0 ? (
          <div className="empty-state">
            <p>No vehicles found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Vehicle Number</th>
                <th>Status</th>
                <th>Assigned Driver</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Active Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles?.map((vehicle) => {
                const assignedDriver = drivers.find(d => d.id === vehicle.assignedDriverId);
                // Find ANY trip for this vehicle (not just ACTIVE)
                const vehicleTrip = trips.find(t => t.vehicleId === vehicle.id);
                // Also check for ACTIVE trips specifically
                const activeTrip = trips.find(t => t.vehicleId === vehicle.id && t.status === 'ACTIVE');
                
                // Calculate duration for active trips
                let duration = '-';
                if (activeTrip && activeTrip.startTime) {
                  const start = new Date(activeTrip.startTime);
                  const now = new Date();
                  const diffMs = now - start;
                  const hours = Math.floor(diffMs / 3600000);
                  const minutes = Math.floor((diffMs % 3600000) / 60000);
                  duration = `${hours}h ${minutes}m`;
                }
                
                const driverDisplay = assignedDriver 
                  ? assignedDriver.name 
                  : (vehicle.assignedDriverId ? `Driver ID: ${vehicle.assignedDriverId}` : 'Not Assigned');
                
                console.log(`Vehicle ${vehicle.vehicleNumber}: trip=`, vehicleTrip, 'activeTrip=', activeTrip);
                
                return (
                  <tr key={vehicle?.id || Math.random()}>
                    <td>{vehicle?.id || 'N/A'}</td>
                    <td>{vehicle?.vehicleNumber || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${vehicle?.status?.toLowerCase() || 'inactive'}`}>
                        {vehicle?.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td>{driverDisplay}</td>
                    <td>
                      {vehicleTrip && vehicleTrip.startTime 
                        ? new Date(vehicleTrip.startTime).toLocaleString() 
                        : '-'}
                    </td>
                    <td>
                      {vehicleTrip && vehicleTrip.endTime 
                        ? new Date(vehicleTrip.endTime).toLocaleString() 
                        : (activeTrip ? 'In Progress' : '-')}
                    </td>
                    <td style={{fontWeight: activeTrip ? 'bold' : 'normal', color: activeTrip ? '#6f42c1' : 'inherit'}}>
                      {duration}
                    </td>
                    <td>
                      <button className="view-btn" onClick={() => handleView(vehicle)}>View</button>
                      <button className="view-btn" onClick={() => handleEdit(vehicle)} style={{marginLeft: '5px', background: '#3b82f6'}}>Edit</button>
                      <button className="view-btn" onClick={() => handleAssignDriver(vehicle.id)} style={{marginLeft: '5px', background: '#10b981'}}>Assign Driver</button>
                      <br style={{marginBottom: '5px'}} />
                      <button className="view-btn" onClick={() => handleDelete(vehicle)} style={{background: '#f44336', marginTop: '5px'}}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editingVehicle && (
        <EditVehicleModal
          vehicle={editingVehicle}
          onClose={handleCloseModal}
          onUpdate={handleUpdateSuccess}
        />
      )}

      {viewingVehicle && (
        <VehicleDetailsModal
          vehicle={viewingVehicle.vehicle}
          driverName={viewingVehicle.driverName}
          tripInfo={viewingVehicle.tripInfo}
          onClose={() => setViewingVehicle(null)}
        />
      )}
    </div>
  );
}

export default Fleet;
