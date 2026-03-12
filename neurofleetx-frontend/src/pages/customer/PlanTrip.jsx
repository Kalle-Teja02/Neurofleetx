import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

function PlanTrip() {
  const navigate = useNavigate();
  const [tripData, setTripData] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    passengers: 1,
    vehicleType: "sedan"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Submit to backend
    alert("Trip planned successfully!");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/customer")} className="back-btn">← Back</button>
        <h1>Plan Trip & Book</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>From</label>
            <input
              type="text"
              placeholder="Enter pickup location"
              value={tripData.from}
              onChange={(e) => setTripData({...tripData, from: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>To</label>
            <input
              type="text"
              placeholder="Enter destination"
              value={tripData.to}
              onChange={(e) => setTripData({...tripData, to: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={tripData.date}
                onChange={(e) => setTripData({...tripData, date: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={tripData.time}
                onChange={(e) => setTripData({...tripData, time: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Passengers</label>
              <input
                type="number"
                min="1"
                max="8"
                value={tripData.passengers}
                onChange={(e) => setTripData({...tripData, passengers: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type</label>
              <select
                value={tripData.vehicleType}
                onChange={(e) => setTripData({...tripData, vehicleType: e.target.value})}
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
              </select>
            </div>
          </div>

          <button type="submit" className="submit-btn">Book Trip</button>
        </form>
      </div>
    </div>
  );
}

export default PlanTrip;
