import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authService";
import "../Auth.css";

function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    phone: "",
    city: "",
    aadhar: "",
    license: "",
    company: "",
    adminRegNo: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await registerUser({
        ...formData,
        role: role
      });

      alert("Registration Successful!");
      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error);
      alert(error.response?.data || "Error registering user");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="left-content">
          <h1 className="brand-title">NeuroFleetX</h1>
          <h2 className="brand-subtitle">
            AI Powered Urban Fleet & Traffic Intelligence
          </h2>
          <p className="brand-description">
            NeuroFleetX is an enterprise-grade intelligent mobility platform
            engineered to optimize urban transportation ecosystems using
            AI-driven analytics, real-time vehicle monitoring, and predictive
            traffic intelligence systems.
          </p>
          <div className="feature-list">
            <div>🚦 Real-time Traffic Monitoring</div>
            <div>🚚 Intelligent Fleet Optimization</div>
            <div>📊 Predictive Route Analytics</div>
            <div>🌍 Smart City Infrastructure Integration</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="form-subtitle">
            Register to access the intelligent mobility dashboard
          </p>

          <form onSubmit={handleSignup}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Create Strong Password"
              required
              value={formData.password}
              onChange={handleChange}
            />

            <select
              name="gender"
              required
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Fleet Manager</option>
              <option value="DRIVER">Driver</option>
              <option value="CUSTOMER">Customer</option>
            </select>

            {role === "ADMIN" && (
              <input
                type="text"
                name="adminRegNo"
                placeholder="Admin Registration Number"
                required
                value={formData.adminRegNo}
                onChange={handleChange}
              />
            )}

            {role === "MANAGER" && (
              <input
                type="text"
                name="company"
                placeholder="Company Name"
                required
                value={formData.company}
                onChange={handleChange}
              />
            )}

            {role === "DRIVER" && (
              <>
                <input
                  type="text"
                  name="license"
                  placeholder="Driving License Number"
                  required
                  value={formData.license}
                  onChange={handleChange}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </>
            )}

            {role === "CUSTOMER" && (
              <>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  required
                  value={formData.city}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="aadhar"
                  placeholder="Aadhar Number"
                  required
                  value={formData.aadhar}
                  onChange={handleChange}
                />
              </>
            )}

            <button type="submit">
              Create Account
            </button>
          </form>

          <p className="link-text">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;