import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/pages.css";

function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get('http://localhost:8082/api/trips/manager/test');
      setTrips(response.data);
      console.log("✅ Loaded", response.data.length, "trips");
    } catch (error) {
      console.error("❌ Error loading trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (trip) => {
    alert(`Trip Details:\n\nID: ${trip.id}\nDriver ID: ${trip.driverId}\nStatus: ${trip.status}\nFare: ₹${trip.fare}\nDate: ${new Date(trip.createdAt).toLocaleString()}\nFleet Manager ID: ${trip.fleetManagerId}`);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
          <h1>Trip Management</h1>
        </div>
        <div className="empty-state">
          <p>Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/manager")} className="back-btn">← Back</button>
        <h1>Trip Management</h1>
      </div>

      <div className="table-card">
        {trips.length === 0 ? (
          <div className="empty-state">
            <p>No trips found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Driver ID</th>
                <th>Status</th>
                <th>Fare</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.id}</td>
                  <td>{trip.driverId}</td>
                  <td>
                    <span className={`status-badge ${trip.status.toLowerCase()}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td>₹{trip.fare.toLocaleString()}</td>
                  <td>{new Date(trip.createdAt).toLocaleDateString()}</td>
                  <td><button className="view-btn" onClick={() => handleView(trip)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Trips;
