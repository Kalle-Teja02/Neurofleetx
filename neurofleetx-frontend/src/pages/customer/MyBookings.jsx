import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

function MyBookings() {
  const navigate = useNavigate();
  const [bookings] = useState([
    { id: "BK3001", from: "Hyderabad", to: "Warangal", date: "2 Mar 2026", status: "Confirmed" },
    { id: "BK3002", from: "Hyderabad", to: "Vijayawada", date: "5 Mar 2026", status: "Pending" },
    { id: "BK3003", from: "Hyderabad", to: "Nizamabad", date: "8 Mar 2026", status: "Confirmed" },
    { id: "BK3004", from: "Hyderabad", to: "Karimnagar", date: "10 Mar 2026", status: "Confirmed" },
    { id: "BK3005", from: "Hyderabad", to: "Khammam", date: "12 Mar 2026", status: "Pending" }
  ]);

  const handleView = (booking) => {
    alert(`Booking Details:\n\nBooking ID: ${booking.id}\nFrom: ${booking.from}\nTo: ${booking.to}\nDate: ${booking.date}\nStatus: ${booking.status}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/customer")} className="back-btn">← Back</button>
        <h1>My Bookings</h1>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>From</th>
              <th>To</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.from}</td>
                <td>{booking.to}</td>
                <td>{booking.date}</td>
                <td>
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <button className="view-btn" onClick={() => handleView(booking)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MyBookings;
