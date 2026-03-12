import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

function MyTripsDriver() {
  const navigate = useNavigate();
  const [trips] = useState([
    { id: "TRP2101", from: "Hyderabad", to: "Warangal", date: "28 Feb 2026", customer: "Priya Sharma", earnings: 500, status: "Completed" },
    { id: "TRP2102", from: "Hyderabad", to: "Vijayawada", date: "27 Feb 2026", customer: "Ananya Singh", earnings: 750, status: "Completed" },
    { id: "TRP2103", from: "Hyderabad", to: "Karimnagar", date: "1 Mar 2026", customer: "Meera Nair", earnings: 300, status: "Active" },
    { id: "TRP2104", from: "Hyderabad", to: "Nizamabad", date: "26 Feb 2026", customer: "Ravi Patel", earnings: 450, status: "Completed" },
    { id: "TRP2105", from: "Hyderabad", to: "Khammam", date: "25 Feb 2026", customer: "Amit Verma", earnings: 400, status: "Completed" },
    { id: "TRP2106", from: "Warangal", to: "Hyderabad", date: "24 Feb 2026", customer: "Deepa Rao", earnings: 500, status: "Completed" },
    { id: "TRP2107", from: "Hyderabad", to: "Nalgonda", date: "23 Feb 2026", customer: "Lakshmi Iyer", earnings: 600, status: "Completed" },
    { id: "TRP2108", from: "Vijayawada", to: "Hyderabad", date: "22 Feb 2026", customer: "Pooja Desai", earnings: 750, status: "Completed" },
    { id: "TRP2109", from: "Hyderabad", to: "Mahbubnagar", date: "21 Feb 2026", customer: "Sanjay Gupta", earnings: 550, status: "Completed" },
    { id: "TRP2110", from: "Hyderabad", to: "Adilabad", date: "20 Feb 2026", customer: "Arun Krishnan", earnings: 900, status: "Completed" }
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/driver")} className="back-btn">← Back</button>
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
              <th>Customer</th>
              <th>Earnings</th>
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
                <td>{trip.customer}</td>
                <td className="earnings">₹{trip.earnings}</td>
                <td>
                  <span className={`status-badge ${trip.status.toLowerCase()}`}>
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

export default MyTripsDriver;
