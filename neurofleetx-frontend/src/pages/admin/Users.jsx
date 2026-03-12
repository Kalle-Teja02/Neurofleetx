import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

function Users() {
  const navigate = useNavigate();
  const [users] = useState([
    { id: 1, name: "Rajesh Kumar", email: "rajesh@example.com", role: "DRIVER", status: "Active" },
    { id: 2, name: "Priya Sharma", email: "priya@example.com", role: "CUSTOMER", status: "Active" },
    { id: 3, name: "Ravi Patel", email: "ravi@example.com", role: "MANAGER", status: "Active" },
    { id: 4, name: "Ananya Singh", email: "ananya@example.com", role: "CUSTOMER", status: "Active" },
    { id: 5, name: "Vikram Reddy", email: "vikram@example.com", role: "DRIVER", status: "Active" },
    { id: 6, name: "Suresh Kumar", email: "suresh@example.com", role: "DRIVER", status: "Inactive" },
    { id: 7, name: "Meera Nair", email: "meera@example.com", role: "CUSTOMER", status: "Active" },
    { id: 8, name: "Amit Verma", email: "amit@example.com", role: "MANAGER", status: "Active" },
    { id: 9, name: "Kiran Kumar", email: "kiran@example.com", role: "DRIVER", status: "Active" },
    { id: 10, name: "Deepa Rao", email: "deepa@example.com", role: "CUSTOMER", status: "Active" },
    { id: 11, name: "Sanjay Gupta", email: "sanjay@example.com", role: "DRIVER", status: "Active" },
    { id: 12, name: "Lakshmi Iyer", email: "lakshmi@example.com", role: "CUSTOMER", status: "Active" },
    { id: 13, name: "Arun Krishnan", email: "arun@example.com", role: "MANAGER", status: "Active" },
    { id: 14, name: "Pooja Desai", email: "pooja@example.com", role: "CUSTOMER", status: "Active" },
    { id: 15, name: "Ramesh Babu", email: "ramesh@example.com", role: "DRIVER", status: "Active" }
  ]);

  const handleEdit = (user) => {
    alert(`Edit user: ${user.name}\n\nThis would open an edit form.`);
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      alert(`User ${user.name} deleted successfully!`);
    }
  };

  const handleAddUser = () => {
    alert("Add New User form would open here.");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/admin")} className="back-btn">← Back</button>
        <h1>Manage Users</h1>
        <button className="primary-btn" onClick={handleAddUser}>Add New User</button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className="role-badge">{user.role}</span></td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button className="view-btn" onClick={() => handleEdit(user)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(user)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
