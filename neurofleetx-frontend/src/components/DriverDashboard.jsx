import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tripService } from "../services/tripService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/driverDashboard.css";

function DriverDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [driverId, setDriverId] = useState(null);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripDuration, setTripDuration] = useState("0 min");
  const [stats] = useState({
    todayEarnings: 3100,
    totalTrips: 187,
    rating: 4.7,
    completedTrips: 180,
    hoursOnline: 9,
    weeklyEarnings: 10500
  });

  const [recentTrips] = useState([
    { id: "TRP2101", route: "Hyderabad → Warangal", status: "Completed", earnings: 500 },
    { id: "TRP2102", route: "Hyderabad → Vijayawada", status: "Completed", earnings: 750 },
    { id: "TRP2103", route: "Hyderabad → Karimnagar", status: "Active", earnings: 300 },
    { id: "TRP2104", route: "Hyderabad → Nizamabad", status: "Completed", earnings: 450 },
    { id: "TRP2105", route: "Warangal → Hyderabad", status: "Completed", earnings: 500 },
    { id: "TRP2106", route: "Hyderabad → Khammam", status: "Completed", earnings: 400 },
    { id: "TRP2107", route: "Vijayawada → Hyderabad", status: "Completed", earnings: 750 }
  ]);

  const [weeklyEarnings] = useState([650, 850, 1400, 1100, 1700, 1300, 1900]);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Driver";
    const userId = localStorage.getItem("userId");
    setUserName(name);
    setDriverId(userId);
    
    if (userId) {
      fetchAssignedVehicle(userId);
      fetchActiveTrip(userId);
    }
  }, []);

  // Update trip duration every second
  useEffect(() => {
    if (activeTrip && activeTrip.startTime) {
      const interval = setInterval(() => {
        const duration = calculateDuration(activeTrip.startTime);
        setTripDuration(duration);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [activeTrip]);

  const calculateDuration = (startTime) => {
    if (!startTime) return '0 min';
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const fetchAssignedVehicle = async (userId) => {
    try {
      const response = await fetch('http://localhost:8082/api/vehicles/test');
      if (response.ok) {
        const vehicles = await response.json();
        const assigned = vehicles.find(v => v.assignedDriverId === parseInt(userId));
        setAssignedVehicle(assigned);
      }
    } catch (error) {
      console.error('Error fetching assigned vehicle:', error);
    }
  };

  const fetchActiveTrip = async (userId) => {
    try {
      const trip = await tripService.getActiveTrip(userId);
      setActiveTrip(trip);
      if (trip) {
        setOnShift(true);
      }
    } catch (error) {
      console.error('Error fetching active trip:', error);
    }
  };

  const handleStartTrip = async () => {
    if (!assignedVehicle) {
      toast.error('❌ No vehicle assigned to you', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (assignedVehicle.status === 'MAINTENANCE') {
      toast.error('❌ Vehicle is under maintenance. Cannot start trip.', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const trip = await tripService.startTrip(driverId, assignedVehicle.id);
      setActiveTrip(trip);
      toast.success('✅ Trip started successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Refresh vehicle status
      fetchAssignedVehicle(driverId);
    } catch (error) {
      toast.error(`❌ ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleEndTrip = async () => {
    if (!activeTrip) {
      toast.error('❌ No active trip to end', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      await tripService.endTrip(activeTrip.id);
      setActiveTrip(null);
      toast.success('✅ Trip ended successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Refresh vehicle status
      fetchAssignedVehicle(driverId);
    } catch (error) {
      toast.error(`❌ ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleViewSchedule = () => {
    navigate("/driver/schedule");
  };

  const handleEarningsReport = () => {
    navigate("/driver/earnings");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="driver-dashboard">
      <nav className="dashboard-navbar">
        <div className="navbar-brand">NeuroFleetX</div>
        <ul className="navbar-menu">
          <li className="active" onClick={() => navigate("/driver")}>Dashboard</li>
          <li onClick={() => navigate("/driver/my-trips")}>My Trips</li>
          <li onClick={() => navigate("/driver/navigation")}>Route Navigation</li>
          <li onClick={() => navigate("/driver/earnings")}>Earnings</li>
          <li onClick={() => navigate("/driver/schedule")}>Schedule</li>
          <li onClick={() => navigate("/driver/profile")}>Profile</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Driver Dashboard</h1>
          <p>Welcome back, {userName}! Ready to hit the road?</p>
        </div>

        {/* Assigned Vehicle Section */}
        {assignedVehicle && (
          <div className="assigned-vehicle-section">
            <h2>🚗 Your Assigned Vehicle</h2>
            <div className="vehicle-info-card">
              <div className="vehicle-details">
                <div className="detail-row">
                  <span className="label">Vehicle Number:</span>
                  <span className="value">{assignedVehicle.vehicleNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Model:</span>
                  <span className="value">{assignedVehicle.model}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${assignedVehicle.status.toLowerCase()}`}>
                    {assignedVehicle.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Battery:</span>
                  <span className="value">{assignedVehicle.batteryPercentage}%</span>
                </div>
                <div className="detail-row">
                  <span className="label">Fuel:</span>
                  <span className="value">{assignedVehicle.fuelPercentage}%</span>
                </div>
                {activeTrip && (
                  <>
                    <div className="detail-row">
                      <span className="label">Trip Status:</span>
                      <span className="trip-active">ACTIVE</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Trip Duration:</span>
                      <span className="value trip-duration">{tripDuration}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="trip-controls">
                {!activeTrip ? (
                  <button 
                    className="action-btn primary trip-btn" 
                    onClick={handleStartTrip}
                    disabled={assignedVehicle.status === 'MAINTENANCE'}
                  >
                    🚀 Start Trip
                  </button>
                ) : (
                  <button 
                    className="action-btn danger trip-btn" 
                    onClick={handleEndTrip}
                  >
                    🏁 End Trip
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!assignedVehicle && (
          <div className="no-vehicle-section">
            <p>⚠️ No vehicle assigned to you yet. Please contact your fleet manager.</p>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💵</div>
            <div className="stat-info">
              <h3>₹{stats.todayEarnings}</h3>
              <p>Today's Earnings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚗</div>
            <div className="stat-info">
              <h3>{stats.totalTrips}</h3>
              <p>Total Trips</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>{stats.rating}</h3>
              <p>Rating</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.completedTrips}</h3>
              <p>Completed Trips</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <h3>{stats.hoursOnline}h</h3>
              <p>Hours Online</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>₹{stats.weeklyEarnings}</h3>
              <p>Weekly Earnings</p>
            </div>
          </div>
        </div>

        <div className="live-tracking">
          <h2>Weekly Earnings Chart</h2>
          <div className="earnings-chart">
            <div className="chart-bars">
              {weeklyEarnings.map((earning, index) => {
                const maxEarning = Math.max(...weeklyEarnings);
                const height = (earning / maxEarning) * 100;
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                return (
                  <div key={index} className="bar-container">
                    <div className="bar" style={{ height: `${height}%` }}>
                      <span className="bar-value">₹{earning}</span>
                    </div>
                    <span className="bar-label">{days[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="actions-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn secondary" onClick={handleViewSchedule}>View Schedule</button>
            <button className="action-btn secondary" onClick={handleEarningsReport}>Earnings Report</button>
          </div>
        </div>

        <div className="recent-trips">
          <h2>Recent Trips</h2>
          <div className="trips-table-container">
            <table className="trips-table">
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{trip.id}</td>
                    <td>{trip.route}</td>
                    <td>
                      <span className={`status-badge ${trip.status.toLowerCase()}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="earnings">₹{trip.earnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
}

export default DriverDashboard;
