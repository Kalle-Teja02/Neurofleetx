# Quick Test Guide - NeuroFleetX

## 🚀 System Status
- ✅ Backend Running: http://localhost:8082
- ✅ Frontend Running: http://localhost:5174
- ✅ Database: MySQL with 500+ trips, 45 vehicles, 10 drivers

## 🎯 Quick Test Scenarios

### Scenario 1: Admin View (Full System Overview)
1. Open http://localhost:5174
2. Login: `admin@neurofleetx.com` / `admin123`
3. **Expected Results**:
   - Total Fleet: 45
   - Total Trips: 500+
   - Active Trips: ~75
   - Total Drivers: 10
   - Total Revenue: ₹200,000+ (varies)
   - Revenue chart shows last 7 days
   - Recent activity feed populated

### Scenario 2: Fleet Manager View (Operations Management)
1. Logout and login: `abc@gmail.com` / `12345`
2. **Expected Results**:
   - Total Revenue: ₹200,000+ (from completed trips)
   - Active Trips: ~75
   - Total Vehicles: 45
   - Active Drivers: 10
   - Average Trip Revenue: ₹500-800
   - Top Driver: Name of best performer
   - Monthly Revenue: Breakdown by month
   - Recent 5 trips table filled

### Scenario 3: Driver View (Individual Driver Experience)
1. Logout and login: `driver1@neurofleetx.com` / `driver123`
2. **Expected Results**:
   - Assigned Vehicle card shows:
     - Vehicle number (e.g., TS09AB1234)
     - Model (e.g., Toyota Innova)
     - Status, Battery %, Fuel %
   - Today's Earnings: ₹3,100+
   - Total Trips: 187+
   - Rating: 4.7
   - Weekly Earnings Chart: Populated
   - Recent Trips Table: 7 trips shown
3. **Test Trip Management**:
   - Click "🚀 Start Trip" → Should show success
   - Trip duration starts counting
   - Click "🏁 End Trip" → Should complete trip

### Scenario 4: Customer View (Booking Experience)
1. Logout and login: `customer@neurofleetx.com` / `customer123`
2. **Expected Results**:
   - Can book new rides
   - View trip history
   - See active bookings

## 🔍 Data Validation Checks

### Check 1: Revenue Consistency
- Admin total revenue ≈ Fleet Manager total revenue
- Both should be > ₹0

### Check 2: Trip Counts
- Admin total trips = 500
- Active + Completed + Cancelled = 500
- ~75% should be completed

### Check 3: Driver Data
- All 10 drivers should have trips assigned
- Each driver should have assigned vehicle
- Earnings should be distributed across drivers

### Check 4: Time Distribution
- Most trips in last 7 days (60%)
- Rush hour concentration (8-10 AM, 5-8 PM)
- Monthly revenue shows current month data

## ⚠️ Known Test Accounts

| Count | Role | Email Pattern | Password |
|-------|------|---------------|----------|
| 1 | Admin | admin@neurofleetx.com | admin123 |
| 1 | Manager | abc@gmail.com | 12345 |
| 10 | Drivers | driver1-10@neurofleetx.com | driver123 |
| 3 | Customers | customer@neurofleetx.com, customer2@..., customer3@... | customer123 |

## 🛠️ Troubleshooting

### Dashboard Shows Zeros?
- Check backend console for "SafeDataLoader complete — trips: 500"
- If not, restart backend with `FORCE_RELOAD = true`

### Frontend Not Loading?
- Check http://localhost:5174 is accessible
- Verify backend at http://localhost:8082/api/vehicles/test

### Login Fails?
- Verify credentials from table above
- Check browser console for errors
- Ensure backend is running

### No Trip Data for Specific Driver?
- Try different drivers (driver1 through driver10)
- Check backend logs for data loading

## 📊 Expected Data Ranges

| Metric | Expected Range |
|--------|----------------|
| Total Revenue | ₹150,000 - ₹300,000 |
| Average Trip Fare | ₹500 - ₹800 |
| Active Trips | 50 - 100 |
| Completed Trips | 350 - 400 |
| Vehicles Available | 15 - 25 |
| Vehicles In Use | 10 - 20 |
| Vehicles Maintenance | 5 - 10 |

## ✅ Test Completion Checklist

- [ ] Admin dashboard loads with all data
- [ ] Fleet manager dashboard shows revenue
- [ ] Driver can see assigned vehicle
- [ ] Driver can start/end trip
- [ ] Customer can access booking
- [ ] Revenue charts display correctly
- [ ] Recent trips table populated
- [ ] All KPIs show non-zero values
