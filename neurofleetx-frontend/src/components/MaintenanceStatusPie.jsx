import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/maintenanceStatusPie.css';

export default function MaintenanceStatusPie() {
  const [data, setData] = useState([]);
  const [vehiclesByStatus, setVehiclesByStatus] = useState({ Healthy: [], Due: [], Critical: [] });
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [maintenanceDetails, setMaintenanceDetails] = useState([]);
  const [expandedStatus, setExpandedStatus] = useState(null);

  useEffect(() => {
    fetchMaintenanceAlerts();
  }, []);

  const fetchMaintenanceAlerts = async () => {
    try {
      setLoading(true);
      
      // Fetch maintenance records from backend
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8082/api/maintenance/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance data');
      }
      
      const maintenanceRecords = await response.json();
      console.log('📋 Maintenance records:', maintenanceRecords);
      
      // Group by vehicle and determine status
      const vehicleStatus = {};
      
      maintenanceRecords.forEach(record => {
        const vehicleId = record.vehicle?.id || record.vehicleId;
        const vehicleNumber = record.vehicle?.vehicleNumber || `Vehicle ${vehicleId}`;
        
        if (!vehicleStatus[vehicleId]) {
          vehicleStatus[vehicleId] = {
            id: vehicleId,
            number: vehicleNumber,
            status: 'Healthy',
            nextService: record.nextServiceDate,
            records: []
          };
        }
        
        vehicleStatus[vehicleId].records.push(record);
        
        // Determine status based on maintenance record status
        if (record.status === 'SCHEDULED') {
          vehicleStatus[vehicleId].status = 'Due';
        } else if (record.status === 'IN_PROGRESS') {
          vehicleStatus[vehicleId].status = 'Critical';
        }
      });
      
      // Count by status
      const statusCount = { Healthy: 0, Due: 0, Critical: 0 };
      const vehiclesByStatusMap = { Healthy: [], Due: [], Critical: [] };
      
      Object.values(vehicleStatus).forEach(vehicle => {
        statusCount[vehicle.status]++;
        vehiclesByStatusMap[vehicle.status].push(vehicle);
      });
      
      const chartData = [
        { name: 'Healthy', value: statusCount.Healthy, color: '#10b981' },
        { name: 'Due', value: statusCount.Due, color: '#f59e0b' },
        { name: 'Critical', value: statusCount.Critical, color: '#ef4444' }
      ];

      setData(chartData);
      setVehiclesByStatus(vehiclesByStatusMap);
      console.log('✅ Maintenance status:', statusCount);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      // Fallback to mock data
      const mockData = [
        { name: 'Healthy', value: 5, color: '#10b981' },
        { name: 'Due', value: 2, color: '#f59e0b' },
        { name: 'Critical', value: 2, color: '#ef4444' }
      ];
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setMaintenanceDetails(vehicle.records || []);
  };

  const toggleStatus = (status) => {
    setExpandedStatus(expandedStatus === status ? null : status);
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="maintenance-status-pie-container">
      <div className="pie-header">
        <h3>🔧 Maintenance Status</h3>
        <button className="refresh-btn" onClick={fetchMaintenanceAlerts}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading maintenance data...</div>
      ) : data.length > 0 ? (
        <div className="pie-content">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} vehicles`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className="status-summary">
            {data.map((item) => (
              <div key={item.name} className="status-item">
                <div className="status-color" style={{ backgroundColor: item.color }}></div>
                <div className="status-info">
                  <div 
                    className="status-header"
                    onClick={() => toggleStatus(item.name)}
                  >
                    <p className="status-name">{item.name}</p>
                    <p className="status-count">{item.value} vehicles</p>
                    <span className={`expand-icon ${expandedStatus === item.name ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </div>
                  
                  {expandedStatus === item.name && vehiclesByStatus[item.name]?.length > 0 && (
                    <div className="vehicle-list-dropdown">
                      {vehiclesByStatus[item.name].map(v => (
                        <button 
                          key={v.id} 
                          className="vehicle-badge-dropdown"
                          onClick={() => handleVehicleClick(v)}
                          title="Click to see maintenance details"
                        >
                          <span className="vehicle-number">{v.number}</span>
                          <span className="next-service">Next: {new Date(v.nextService).toLocaleDateString()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-data">No maintenance data available</div>
      )}

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚗 {selectedVehicle.number}</h2>
              <button className="close-btn" onClick={() => setSelectedVehicle(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="vehicle-status-badge" style={{
                backgroundColor: selectedVehicle.status === 'Healthy' ? '#10b981' : 
                                selectedVehicle.status === 'Due' ? '#f59e0b' : '#ef4444'
              }}>
                Status: {selectedVehicle.status}
              </div>

              <h3>Maintenance Records</h3>
              {maintenanceDetails.length > 0 ? (
                <div className="maintenance-records">
                  {maintenanceDetails.map((record, idx) => (
                    <div key={idx} className="record-item">
                      <div className="record-header">
                        <span className="record-description">{record.description}</span>
                        <span className={`record-status ${record.status.toLowerCase()}`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="record-details">
                        <p><strong>Cost:</strong> ₹{record.cost?.toFixed(2) || 'N/A'}</p>
                        <p><strong>Service Date:</strong> {new Date(record.serviceDate).toLocaleDateString()}</p>
                        <p><strong>Next Service:</strong> {new Date(record.nextServiceDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-records">No maintenance records found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
