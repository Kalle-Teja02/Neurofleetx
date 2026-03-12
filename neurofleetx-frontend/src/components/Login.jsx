import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authService";
import "../Auth.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser({
        email,
        password
      });

      const token = response.data.token;
      const userName = response.data.name;
      const userEmail = response.data.email;
      const userRole = response.data.role; // Get role from backend
      const userId = response.data.userId; // Get user ID from backend
      
      // Store JWT token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("userName", userName);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("userId", userId);

      console.log("✅ JWT Token received:", token);
      console.log("✅ User:", userName, userEmail);
      console.log("✅ Role from database:", userRole);
      console.log("✅ User ID:", userId);

      alert(`Login Successful!\n\nUser: ${userName}\nRole: ${userRole}\nToken stored in localStorage`);

      // Role-based redirect using database role
      if (userRole === "ADMIN") navigate("/admin");
      else if (userRole === "MANAGER") navigate("/manager");
      else if (userRole === "DRIVER") navigate("/driver");
      else if (userRole === "CUSTOMER") navigate("/customer");
      else navigate("/");

    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <div className="top-header">
        <h1>Welcome Back to NeuroFleetX</h1>
        <p>Please enter your details to login</p>
      </div>

      <div className="auth-wrapper">
        <div className="auth-left">
          <div className="left-content">
            <h2 className="brand-subtitle">Smart Fleet Management</h2>
            <p className="brand-description">
              Manage vehicles, track performance, monitor drivers, 
              and optimize operations with NeuroFleetX.
            </p>
            <div className="feature-list">
              <div>✔ Real-time Vehicle Tracking</div>
              <div>✔ Driver Performance Analytics</div>
              <div>✔ Predictive Maintenance Alerts</div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Login</button>
            </form>
            <p className="link-text">
              Don't have an account? <Link to="/">Signup</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;