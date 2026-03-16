# Maintenance Dashboard Implementation Summary

## Overview
A comprehensive Maintenance Dashboard has been added to the Fleet Manager Dashboard in the NeuroFleetX project. This dashboard monitors vehicle parameters and generates alerts for overspeed and maintenance issues.

## Files Created

### 1. Frontend Component
**File:** `neurofleetx-frontend/src/components/MaintenanceDashboard.jsx`

**Features:**
- Fetches real vehicle data from backend API (`/api/vehicles/test`)
- Enriches vehicles with simulated sensor data:
  - Engine Health: 60-100%
  - Tire Condition: 50-100%
  - Fuel Level: 30-100%
  - Battery Health: 40-100%
  - Speed: 60-120 km/h
  - Mileage: 5000-20000 km
- Generates maintenance dates:
  - Last Maintenance: Random date within last 90 days
  - Next Maintenance: Random date within next 90 days
- Auto-refreshes every 30 seconds

### 2. Frontend Styling
**File:** `neurofleetx-frontend/src/styles/maintenanceDashboard.css`

**Styling includes:**
- Responsive design for desktop and mobile
- Color-coded health bars (Green: Healthy, Yellow: Warning, Red: Critical)
- Professional table layouts with hover effects
- Alert severity color coding
- Gradient headers and buttons

### 3. Integration
**File:** `neurofleetx-frontend/src/components/FleetManagerDashboard.jsx` (Updated)

**Changes:**
- Imported MaintenanceDashboard component
- Added Maintenance Dashboard section at the bottom of the Fleet Manager Dashboard
- Maintains existing dashboard functionality

## Features Implemented

### Feature 1: Vehicle Parameters
Each vehicle displays:
- ✅ Vehicle ID (Vehicle Number)
- ✅ Engine Health (%)
- ✅ Tire Condition (%)
- ✅ Fuel Level (%)
- ✅ Battery Health (%)
- ✅ Speed (km/h)
- ✅ Mileage (km)
- ✅ Last Maintenance Date
- ✅ Next Maintenance Date

### Feature 2: Maintenance Schedule
- ✅ Last Maintenance Date displayed in table
- ✅ Next Maintenance Date displayed in table
- ✅ Dates calculated with 90-day intervals

### Feature 3: Alert System
Generates alerts based on:
1. **Overspeed Warning** (Speed > 100 km/h)
   - Action: Notify Driver
   - Severity: HIGH

2. **Service Required** (Mileage > 15000 km)
   - Action: Schedule Maintenance
   - Severity: MEDIUM

3. **Low Engine Health** (< 70%)
   - Action: Check Engine
   - Severity: HIGH

4. **Low Battery Health** (< 50%)
   - Action: Replace Battery
   - Severity: MEDIUM

5. **Low Fuel Level** (< 40%)
   - Action: Refuel Vehicle
   - Severity: LOW

### Feature 4: Vehicle Health Table
Displays all vehicle parameters with:
- Color-coded health bars
- Real-time values
- Highlighted alert conditions
- Maintenance dates

### Feature 5: Alert Table
Shows active alerts with:
- Vehicle ID
- Issue description
- Action needed
- Severity level (HIGH/MEDIUM/LOW)
- Timestamp

## Dashboard Layout

```
Fleet Manager Dashboard
├── KPI Cards (Revenue, Trips, Vehicles, Drivers)
├── Monthly Revenue Chart
├── Recent Trips Table
└── Maintenance Dashboard
    ├── Vehicle Health Status Table
    │   ├── Vehicle parameters with health bars
    │   ├── Speed and mileage with alert highlighting
    │   └── Maintenance dates
    └── Active Alerts Table
        ├── Alert details
        ├── Severity indicators
        └── Action items
```

## Data Flow

1. **Backend** → Provides vehicle data via `/api/vehicles/test`
2. **Frontend** → Fetches and enriches with simulated sensor data
3. **Alert Generation** → Analyzes parameters and creates alerts
4. **Display** → Shows health table and active alerts
5. **Auto-Refresh** → Updates every 30 seconds

## Color Coding

### Health Status
- 🟢 **Green** (≥70%): Healthy
- 🟡 **Yellow** (50-69%): Warning
- 🔴 **Red** (<50%): Critical

### Alert Severity
- 🔴 **HIGH**: Overspeed, Low Engine Health
- 🟡 **MEDIUM**: Service Required, Low Battery
- 🔵 **LOW**: Low Fuel Level

## Usage

1. Log in as Fleet Manager (abc@gmail.com / 12345)
2. Navigate to Dashboard
3. Scroll down to see "Maintenance Dashboard" section
4. View vehicle health parameters and active alerts
5. Click "Refresh" button to manually update data

## Technical Details

- **Frontend Framework:** React
- **State Management:** useState, useEffect hooks
- **API Integration:** Fetch API with JWT authentication
- **Styling:** CSS with responsive design
- **Data Simulation:** Random values within realistic ranges
- **Auto-refresh:** 30-second interval

## Future Enhancements

- Real sensor data integration from IoT devices
- Historical trend analysis
- Predictive maintenance recommendations
- Driver notification system
- Export alerts to CSV/PDF
- Custom alert thresholds
- Integration with maintenance scheduling system
