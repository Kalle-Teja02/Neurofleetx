import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./components/AdminDashboard";
import FleetManagerDashboard from "./components/FleetManagerDashboard";
import DriverDashboard from "./components/DriverDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import "leaflet/dist/leaflet.css";

// Customer Pages
import MyTrips from "./pages/customer/MyTrips";
import MyBookings from "./pages/customer/MyBookings";
import PlanTrip from "./pages/customer/PlanTrip";
import Profile from "./pages/customer/Profile";

// Admin Pages
import Users from "./pages/admin/Users";
import AdminDrivers from "./pages/admin/Drivers";
import Analytics from "./pages/admin/Analytics";

// Manager Pages
import Fleet from "./pages/manager/Fleet";
import ManagerDrivers from "./pages/manager/ManagerDrivers";
import Trips from "./pages/manager/Trips";
import Maintenance from "./pages/manager/Maintenance";
import Reports from "./pages/manager/Reports";
import FleetInventoryPage from "./pages/FleetInventoryPage";

import CustomerBookingPage from "./pages/customer/CustomerBookingPage";
import MyTripsDriver from "./pages/driver/MyTripsDriver";
import Earnings from "./pages/driver/Earnings";
import Schedule from "./pages/driver/Schedule";
import DriverProfile from "./pages/driver/DriverProfile";
import RouteNavigation from "./pages/driver/RouteNavigation";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/admin/drivers" element={<ProtectedRoute><AdminDrivers /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route
          path="/manager"
          element={
            <ProtectedRoute>
              <FleetManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/manager/fleet" element={<ProtectedRoute><Fleet /></ProtectedRoute>} />
        <Route path="/manager/drivers" element={<ProtectedRoute><ManagerDrivers /></ProtectedRoute>} />
        <Route path="/manager/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
        <Route path="/manager/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/manager/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/fleet-inventory" element={<ProtectedRoute><FleetInventoryPage /></ProtectedRoute>} />
        <Route
          path="/driver"
          element={
            <ProtectedRoute>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/driver/my-trips" element={<ProtectedRoute><MyTripsDriver /></ProtectedRoute>} />
        <Route path="/driver/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
        <Route path="/driver/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/driver/profile" element={<ProtectedRoute><DriverProfile /></ProtectedRoute>} />
        <Route path="/driver/navigation" element={<ProtectedRoute><RouteNavigation /></ProtectedRoute>} />
        <Route
          path="/customer"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/customer/my-trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
        <Route path="/customer/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/customer/plan-trip" element={<ProtectedRoute><PlanTrip /></ProtectedRoute>} />
        <Route path="/customer/book" element={<ProtectedRoute><CustomerBookingPage /></ProtectedRoute>} />
        <Route path="/customer/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;