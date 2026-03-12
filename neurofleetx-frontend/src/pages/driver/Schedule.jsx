import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

function Schedule() {
  const navigate = useNavigate();
  const [schedule] = useState([
    { id: 1, date: "2 Mar 2026", time: "09:00 AM", from: "Hyderabad", to: "Warangal", customer: "Priya Sharma", status: "Scheduled" },
    { id: 2, date: "2 Mar 2026", time: "02:00 PM", from: "Warangal", to: "Hyderabad", customer: "Ananya Singh", status: "Scheduled" },
    { id: 3, date: "3 Mar 2026", time: "10:30 AM", from: "Hyderabad", to: "Vijayawada", customer: "Meera Nair", status: "Scheduled" },
    { id: 4, date: "3 Mar 2026", time: "04:00 PM", from: "Vijayawada", to: "Hyderabad", customer: "Ravi Patel", status: "Scheduled" },
    { id: 5, date: "4 Mar 2026", time: "08:00 AM", from: "Hyderabad", to: "Nizamabad", customer: "Deepa Rao", status: "Scheduled" },
    { id: 6, date: "4 Mar 2026", time: "01:30 PM", from: "Nizamabad", to: "Hyderabad", customer: "Lakshmi Iyer", status: "Scheduled" },
    { id: 7, date: "5 Mar 2026", time: "11:00 AM", from: "Hyderabad", to: "Karimnagar", customer: "Pooja Desai", status: "Scheduled" },
    { id: 8, date: "5 Mar 2026", time: "05:00 PM", from: "Karimnagar", to: "Hyderabad", customer: "Sanjay Gupta", status: "Scheduled" }
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/driver")} className="back-btn">← Back</button>
        <h1>My Schedule</h1>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>From</th>
              <th>To</th>
              <th>Customer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.time}</td>
                <td>{item.from}</td>
                <td>{item.to}</td>
                <td>{item.customer}</td>
                <td>
                  <span className="status-badge scheduled">
                    {item.status}
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

export default Schedule;
