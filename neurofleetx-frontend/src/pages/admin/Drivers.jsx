import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

function Drivers() {
  const navigate = useNavigate();
  const [drivers] = useState([
    { id: 1, name: "Rajesh Kumar", license: "DL1234567890", phone: "9876543210", rating: 4.8, status: "Active" },
    { id: 2, name: "Amit Singh", license: "DL2345678901", phone: "9876543211", rating: 4.6, status: "Active" },
    { id: 3, name: "Vikram Patel", license: "DL3456789012", phone: "9876543212", rating: 4.9, status: "Active" },
    { id: 4, name: "Suresh Reddy", license: "DL4567890123", phone: "9876543213", rating: 4.5, status: "Active" },
    { id: 5, name: "Kiran Kumar", license: "DL5678901234", phone: "9876543214", rating: 4.7, status: "Inactive" },
    { id: 6, name: "Sanjay Gupta", license: "DL6789012345", phone: "9876543215", rating: 4.8, status: "Active" },
    { id: 7, name: "Ramesh Babu", license: "DL7890123456", phone: "9876543216", rating: 4.6, status: "Active" },
    { id: 8, name: "Prakash Rao", license: "DL8901234567", phone: "9876543217", rating: 4.9, status: "Active" },
    { id: 9, name: "Naveen Kumar", license: "DL9012345678", phone: "9876543218", rating: 4.7, status: "Active" },
    { id: 10, name: "Harish Reddy", license: "DL0123456789", phone: "9876543219", rating: 4.5, status: "Active" }
  ]);

  const handleView = (driver) => {
    alert(`Driver Details:\n\nName: ${driver.name}\nLicense: ${driver.license}\nPhone: ${driver.phone}\nRating: ${driver.rating}⭐\nStatus: ${driver.status}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/admin")} className="back-btn">← Back</button>
        <h1>Manage Drivers</h1>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>License</th>
              <th>Phone</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.id}</td>
                <td>{driver.name}</td>
                <td>{driver.license}</td>
                <td>{driver.phone}</td>
                <td>{driver.rating} ⭐</td>
                <td>
                  <span className={`status-badge ${driver.status.toLowerCase()}`}>
                    {driver.status}
                  </span>
                </td>
                <td>
                  <button className="view-btn" onClick={() => handleView(driver)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Drivers;
