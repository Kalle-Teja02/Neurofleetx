import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

function MyTrips() {
  const navigate = useNavigate();
  const [trips] = useState([
    { id: "TRP2901", from: "Hyderabad", to: "Nizamabad", date: "20 Feb 2026", driver: "Rajesh Kumar", amount: 850, status: "Completed" },
    { id: "TRP2880", from: "Hyderabad", to: "Khammam", date: "18 Feb 2026", driver: "Amit Singh", amount: 720, status: "Completed" },
    { id: "TRP2850", from: "Hyderabad", to: "Warangal", date: "15 Feb 2026", driver: "Vikram Patel", amount: 500, status: "Completed" },
    { id: "TRP2820", from: "Hyderabad", to: "Vijayawada", date: "12 Feb 2026", driver: "Suresh Reddy", amount: 750, status: "Completed" },
    { id: "TRP2800", from: "Hyderabad", to: "Karimnagar", date: "10 Feb 2026", driver: "Rajesh Kumar", amount: 300, status: "Completed" },
    { id: "TRP2780", from: "Hyderabad", to: "Nalgonda", date: "8 Feb 2026", driver: "Sanjay Gupta", amount: 600, status: "Completed" },
    { id: "TRP2760", from: "Hyderabad", to: "Mahbubnagar", date: "5 Feb 2026", driver: "Ramesh Babu", amount: 550, status: "Completed" },
    { id: "TRP2740", from: "Warangal", to: "Hyderabad", date: "3 Feb 2026", driver: "Prakash Rao", amount: 500, status: "Completed" },
    { id: "TRP2720", from: "Hyderabad", to: "Adilabad", date: "1 Feb 2026", driver: "Naveen Kumar", amount: 900, status: "Completed" },
    { id: "TRP2700", from: "Vijayawada", to: "Hyderabad", date: "28 Jan 2026", driver: "Harish Reddy", amount: 750, status: "Completed" }
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/customer")} className="back-btn">← Back</button>
        <h1>My Trips</h1>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>From</th>
              <th>To</th>
              <th>Date</th>
              <th>Driver</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.id}</td>
                <td>{trip.from}</td>
                <td>{trip.to}</td>
                <td>{trip.date}</td>
                <td>{trip.driver}</td>
                <td className="fare">₹{trip.amount}</td>
                <td>
                  <span className="status-badge completed">
                    {trip.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MyTrips;
