import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    aadhar: ""
  });

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    setProfile({ ...profile, email, name });
    // TODO: Fetch full profile from backend
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    // TODO: Update profile in backend
    alert("Profile updated successfully!");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/customer")} className="back-btn">← Back</button>
        <h1>My Profile</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => setProfile({...profile, city: e.target.value})}
            />
          </div>

          <button type="submit" className="submit-btn">Update Profile</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
