import React, { useState, useEffect, useCallback } from 'react';
import VehicleCard from './VehicleCard';
import EditVehicleModal from './EditVehicleModal';
import { tripService } from '../services/tripService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/vehicleDashboard.css';

const VehicleDashboard = ({ refreshTrigger }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [drivers, setDrivers] = useState({});
  const [activeTrips, setActiveTrips] = useState({});
  const [lastFetch, setLastFetch] = useState(0);

  const fetchVehicles = useCallback(async () => {
    try {
      console.log('🔄 Fetching vehicles... timestamp:', Date.now());
      setLoading(true);
      setError(null);
      
      // Direct fetch with no-cache headers
      const response = await fetch('http://localhost:8082/api/vehicles/test', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}: ${response.statusText}. Make sure Spring Boot is running on port 8082.`);
      }
      
      const data = await response.json();
      console.log('✅ Received vehicles:', data.length, 'vehicles');
      
      if (Array.isArray(data)) {
        // Force new array reference
        setVehicles([...data]);
        setLastFetch(Date.now());
        console.log('✅ Updated vehicles state');
        
        // Fetch driver names
        await fetchDriverNames(data);
      } else {
        setVehicles([]);
        setError('Invalid data format from backend');
      }
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      setError(error.message || 'Failed to load vehicles. Is the backend running on port 8082?');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDriverNames = async (vehicleList) => {
    try {
      const response = await fetch('http://localhost:8082/api/drivers/manager/test', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const allDrivers = await response.json();
        const driverMap = {};
        allDrivers.forEach(driver => {
          driverMap[driver.id] = driver.name;
        });
        setDrivers({...driverMap});
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchActiveTrips = useCallback(async () => {
    try {
      const trips = await tripService.getAllActiveTrips();
      const tripMap = {};
      trips.forEach(trip => {
        if (trip.vehicleId) {
          tripMap[trip.vehicleId] = trip;
        }
      });
      setActiveTrips({...tripMap});
    } catch (error) {
      console.error('Error fetching active trips:', error);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 RefreshTrigger changed:', refreshTrigger);
    fetchVehicles();
    fetchActiveTrips();
  }, [refreshTrigger, fetchVehicles, fetchActiveTrips]);

  // Fetch active trips periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveTrips();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchActiveTrips]);

  // Telemetry simulation
  useEffect(() => {
    if (vehicles.length === 0) return;
    const interval = setInterval(() => {
      simulateTelemetryUpdate();
    }, 5000);
    return () => clearInterval(interval);
  }, [vehicles.length]);

  const simulateTelemetryUpdate = () => {
    setVehicles(prevVehicles => {
      if (!Array.isArray(prevVehicles) || prevVehicles.length === 0) {
        return prevVehicles;
      }
      
      const updated = prevVehicles.map(vehicle => {
        // Only update vehicles that are IN_USE
        if (vehicle.status === 'IN_USE') {
          const updatedVehicle = {
            ...vehicle,
            batteryPercentage: Math.max(0, vehicle.batteryPercentage - Math.floor(Math.random() * 3 + 1)),
            fuelPercentage: Math.max(0, vehicle.fuelPercentage - Math.floor(Math.random() * 2 + 1)),
            speed: Math.random() * 80,
            latitude: vehicle.latitude + (Math.random() * 0.001 - 0.0005),
            longitude: vehicle.longitude + (Math.random() * 0.001 - 0.0005)
          };

          const needsMaintenance = updatedVehicle.batteryPercentage < 20 || updatedVehicle.fuelPercentage < 15;
          const wasNotInMaintenance = vehicle.status !== 'MAINTENANCE';
          
          if (needsMaintenance && wasNotInMaintenance) {
            toast.warning(
              `⚠️ Maintenance Alert: Vehicle ${vehicle.vehicleNumber} requires service. Battery: ${updatedVehicle.batteryPercentage}%, Fuel: ${updatedVehicle.fuelPercentage}%`,
              {
                position: "top-right",
                autoClose: 5000,
              }
            );
          }

          // Update backend silently
          fetch(`http://localhost:8082/api/vehicles/test/${vehicle.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedVehicle)
          }).catch(err => console.error('Telemetry update failed:', err));

          return updatedVehicle;
        }
        return vehicle;
      });
      
      return [...updated]; // Force new array reference
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8082/api/vehicles/test/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
      
      toast.success('✅ Vehicle deleted successfully!');
      // Force immediate refresh
      await fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('❌ Failed to delete vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
  };

  const handleCloseModal = () => {
    setEditingVehicle(null);
  };

  const handleUpdateSuccess = async () => {
    setEditingVehicle(null);
    // Force immediate refresh
    await fetchVehicles();
  };

  const handleServiceComplete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8082/api/vehicles/${id}/service-complete`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error('Failed to service vehicle');
      }
      
      toast.success('✅ Vehicle serviced successfully!');
      // Force immediate refresh
      await fetchVehicles();
    } catch (error) {
      console.error('Error servicing vehicle:', error);
      toast.error('❌ Failed to service vehicle');
    }
  };

  // Filter and search logic
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesStatus = filterStatus === 'ALL' || vehicle.status === filterStatus;
    const matchesSearch = vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate summary stats
  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'AVAILABLE').length,
    inUse: vehicles.filter(v => v.status === 'IN_USE').length,
    maintenance: vehicles.filter(v => v.status === 'MAINTENANCE').length
  };

  if (loading) {
    return (
      <div className="vehicle-dashboard">
        <div className="loading">Loading vehicles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicle-dashboard">
        <div className="error">
          <p style={{color: 'red', fontSize: '1.2rem'}}>{error}</p>
          <button onClick={fetchVehicles} style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginTop: '1rem'
          }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-dashboard">
      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card total">
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <h3>Total Vehicles</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card available">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Available</h3>
            <p className="stat-value">{stats.available}</p>
          </div>
        </div>
        <div className="stat-card in-use">
          <div className="stat-icon">🚙</div>
          <div className="stat-info">
            <h3>In Use</h3>
            <p className="stat-value">{stats.inUse}</p>
          </div>
        </div>
        <div className="stat-card maintenance">
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <h3>Maintenance</h3>
            <p className="stat-value">{stats.maintenance}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by vehicle number or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All Vehicles</option>
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="dashboard-header">
        <h2>Fleet Inventory ({filteredVehicles.length} vehicles) - Last updated: {new Date(lastFetch).toLocaleTimeString()}</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={async () => {
              console.log('🔄 Manual refresh clicked');
              await fetchVehicles();
              await fetchActiveTrips();
            }} 
            className="refresh-btn"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: loading ? '#94a3b8' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh Now'}
          </button>
          <div className="telemetry-indicator">
            <span className="pulse"></span>
            Live Telemetry Active
          </div>
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="empty-state">
          <p>{searchQuery || filterStatus !== 'ALL' ? 'No vehicles match your filters' : 'No vehicles found. Add your first vehicle above!'}</p>
        </div>
      ) : (
        <div className="vehicle-grid">
          {filteredVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onServiceComplete={handleServiceComplete}
              driverName={vehicle.assignedDriverId ? drivers[vehicle.assignedDriverId] : null}
              tripInfo={activeTrips[vehicle.id]}
            />
          ))}
        </div>
      )}

      {editingVehicle && (
        <EditVehicleModal
          vehicle={editingVehicle}
          onClose={handleCloseModal}
          onUpdate={handleUpdateSuccess}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default VehicleDashboard;
