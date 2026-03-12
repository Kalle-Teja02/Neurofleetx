import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/addVehicleForm.css';

const AddVehicleForm = ({ onVehicleAdded }) => {
  // Get the logged-in user's ID from localStorage
  const managerId = parseInt(localStorage.getItem('userId')) || 3;
  
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    model: '',
    status: 'AVAILABLE',
    assignedDriverId: null,
    latitude: 17.385044,
    longitude: 78.486671,
    batteryPercentage: 100,
    fuelPercentage: 100,
    fleetManagerId: managerId
  });

  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/drivers/manager/test');
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'batteryPercentage' || name === 'fuelPercentage' || name === 'fleetManagerId' || name === 'assignedDriverId'
        ? (value ? parseInt(value) : null)
        : name === 'latitude' || name === 'longitude'
        ? parseFloat(value)
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📤 Submitting vehicle:', formData);
      
      const response = await fetch('http://localhost:8082/api/vehicles/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add vehicle');
      }

      const result = await response.json();
      console.log('✅ Vehicle added:', result);
      
      toast.success(`✅ Vehicle ${formData.vehicleNumber} added successfully!`, {
        position: "top-right",
        autoClose: 1000,
      });
      
      // Reset form
      setFormData({
        vehicleNumber: '',
        model: '',
        status: 'AVAILABLE',
        assignedDriverId: null,
        latitude: 17.385044,
        longitude: 78.486671,
        batteryPercentage: 100,
        fuelPercentage: 100,
        fleetManagerId: managerId
      });

      // Reload after toast
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 1200);
    } catch (error) {
      console.error('❌ Error adding vehicle:', error);
      
      const errorMsg = error.message || 'Failed to add vehicle';
      
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-vehicle-form">
      <h2>Add New Vehicle</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Vehicle Number *</label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              placeholder="e.g., TS09AB1234"
              required
            />
          </div>

          <div className="form-group">
            <label>Model *</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., Toyota Innova"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="AVAILABLE">Available</option>
              <option value="IN_USE">In Use</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assigned Driver</label>
            <select
              name="assignedDriverId"
              value={formData.assignedDriverId || ''}
              onChange={handleChange}
            >
              <option value="">No Driver</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} (ID: {driver.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fleet Manager ID *</label>
            <input
              type="number"
              name="fleetManagerId"
              value={formData.fleetManagerId}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="number"
              step="0.000001"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input
              type="number"
              step="0.000001"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Battery % (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              name="batteryPercentage"
              value={formData.batteryPercentage}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Fuel % (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              name="fuelPercentage"
              value={formData.fuelPercentage}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Adding...' : '➕ Add Vehicle'}
        </button>
      </form>
    </div>
  );
};

export default AddVehicleForm;
