import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/vehicleWearChart.css';

export default function VehicleWearChart() {
  const [data, setData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('engineTemp');
  const [selectedVehicle, setSelectedVehicle] = useState('TS09AB1234');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchHealthData();
  }, [selectedVehicle]);

  const fetchVehicles = async () => {
    try {
      // Fetch vehicles from backend
      const response = await fetch('http://localhost:8082/api/vehicles/test');
      if (response.ok) {
        const vehicleList = await response.json();
        setVehicles(vehicleList);
        if (vehicleList.length > 0) {
          setSelectedVehicle(vehicleList[0].vehicleNumber);
        }
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      // Fallback to mock vehicles
      setVehicles([
        { id: 1, vehicleNumber: 'TS09AB1234', model: 'Toyota Innova' },
        { id: 2, vehicleNumber: 'TS08XY5678', model: 'Maruti Ertiga' },
        { id: 3, vehicleNumber: 'TS10CD9012', model: 'Honda City' }
      ]);
    }
  };

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Mock data - simulating vehicle health metrics over time
      // In real scenario, this would be fetched from backend based on selectedVehicle
      const mockData = [
        { time: '1h', engineTemp: 85, tirePressure: 32, fuel: 95, battery: 98 },
        { time: '2h', engineTemp: 88, tirePressure: 31.8, fuel: 92, battery: 96 },
        { time: '3h', engineTemp: 92, tirePressure: 31.5, fuel: 88, battery: 94 },
        { time: '4h', engineTemp: 95, tirePressure: 31.2, fuel: 84, battery: 91 },
        { time: '5h', engineTemp: 98, tirePressure: 30.9, fuel: 79, battery: 88 },
        { time: '6h', engineTemp: 102, tirePressure: 30.5, fuel: 74, battery: 85 },
        { time: '7h', engineTemp: 105, tirePressure: 30.2, fuel: 68, battery: 81 },
        { time: '8h', engineTemp: 108, tirePressure: 29.8, fuel: 62, battery: 77 }
      ];
      
      setData(mockData);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metricConfig = {
    engineTemp: { label: 'Engine Temp (°C)', color: '#ef4444', unit: '°C' },
    tirePressure: { label: 'Tire Pressure (PSI)', color: '#3b82f6', unit: 'PSI' },
    fuel: { label: 'Fuel Level (%)', color: '#f59e0b', unit: '%' },
    battery: { label: 'Battery (%)', color: '#10b981', unit: '%' }
  };

  const currentMetric = metricConfig[selectedMetric];

  return (
    <div className="vehicle-wear-chart-container">
      <div className="chart-header">
        <h3>📊 Vehicle Wear Over Time</h3>
        <div className="selectors">
          <select 
            value={selectedVehicle} 
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="vehicle-dropdown"
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.vehicleNumber}>
                {vehicle.vehicleNumber} - {vehicle.model}
              </option>
            ))}
          </select>
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="metric-dropdown"
          >
            <option value="engineTemp">Engine Temperature</option>
            <option value="tirePressure">Tire Pressure</option>
            <option value="fuel">Fuel Level</option>
            <option value="battery">Battery Level</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading chart data...</div>
      ) : data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" label={{ value: currentMetric.unit, angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: `2px solid ${currentMetric.color}` }}
              formatter={(value) => `${value} ${currentMetric.unit}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke={currentMetric.color} 
              dot={{ fill: currentMetric.color, r: 4 }}
              activeDot={{ r: 6 }}
              name={currentMetric.label}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="no-data">No data available</div>
      )}
    </div>
  );
}
