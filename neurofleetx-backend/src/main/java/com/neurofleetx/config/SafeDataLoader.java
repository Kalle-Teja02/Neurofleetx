package com.neurofleetx.config;

import com.neurofleetx.entity.Maintenance;
import com.neurofleetx.entity.Trip;
import com.neurofleetx.entity.User;
import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.repository.MaintenanceRepository;
import com.neurofleetx.repository.TripRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class SafeDataLoader implements CommandLineRunner {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MaintenanceRepository maintenanceRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // 🔥 FORCE RELOAD - Set to false after first successful run
    private static final boolean FORCE_RELOAD = true;

    @Override
    public void run(String... args) throws Exception {
        if (!FORCE_RELOAD) {
            System.out.println("⏭️  Data loading skipped (FORCE_RELOAD = false)");
            return;
        }
        
        Random random = new Random();
        
        System.out.println("🔥 Reloading dashboard dummy data...");
        
        // 1️⃣ Find existing Fleet Manager
        User fleetManager = userRepository.findAll().stream()
                .filter(u -> "MANAGER".equals(u.getRole()))
                .findFirst()
                .orElse(null);
        
        if (fleetManager == null) {
            System.out.println("⚠️  WARNING: No Fleet Manager found in database!");
            System.out.println("💡 Creating default Fleet Manager...");
            
            fleetManager = new User();
            fleetManager.setEmail("manager@neurofleetx.com");
            fleetManager.setPassword(passwordEncoder.encode("manager123"));
            fleetManager.setName("Fleet Manager");
            fleetManager.setRole("MANAGER");
            fleetManager.setActive(true);
            fleetManager.setPhone("9876543210");
            fleetManager = userRepository.save(fleetManager);
        }
        
        Long managerId = fleetManager.getId();
        System.out.println("🔍 Fleet Manager ID: " + managerId + " (" + fleetManager.getEmail() + ")");
        
        // 2️⃣ Clear existing data
        System.out.println("🔥 Clearing existing data...");
        maintenanceRepository.deleteAll();
        tripRepository.deleteAll();
        vehicleRepository.deleteAll();
        
        // Delete only dummy drivers (those with fleetManagerId set)
        List<User> dummyDrivers = userRepository.findByRoleAndFleetManagerId("DRIVER", managerId);
        if (!dummyDrivers.isEmpty()) {
            userRepository.deleteAll(dummyDrivers);
            System.out.println("✅ Cleared " + dummyDrivers.size() + " dummy drivers");
        }
        
        // 3️⃣ Insert 5 Drivers
        System.out.println("📦 Inserting dummy drivers...");
        List<User> driversList = createDrivers(managerId);
        System.out.println("✅ Drivers inserted: " + driversList.size());
        
        // 4️⃣ Insert 8 Vehicles
        System.out.println("📦 Inserting dummy vehicles...");
        List<Vehicle> vehiclesList = createVehicles(managerId);
        System.out.println("✅ Vehicles inserted: " + vehiclesList.size());
        
        // 5️⃣ Insert 50 Trips
        System.out.println("📦 Inserting dummy trips...");
        List<Trip> tripsList = createTrips(managerId, driversList, vehiclesList, random);
        System.out.println("✅ Trips inserted: " + tripsList.size());
        
        // Count trips by status
        long completedCount = tripsList.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        long activeCount = tripsList.stream().filter(t -> "ACTIVE".equals(t.getStatus())).count();
        long cancelledCount = tripsList.stream().filter(t -> "CANCELLED".equals(t.getStatus())).count();
        System.out.println("   - COMPLETED: " + completedCount);
        System.out.println("   - ACTIVE: " + activeCount);
        System.out.println("   - CANCELLED: " + cancelledCount);
        
        // 6️⃣ Insert Maintenance Records
        System.out.println("📦 Inserting maintenance records...");
        List<Maintenance> maintenanceList = createMaintenanceRecords(vehiclesList, random);
        System.out.println("✅ Maintenance records inserted: " + maintenanceList.size());

        System.out.println("✅ SafeDataLoader completed successfully!");
        System.out.println("📊 Dashboard URL: http://localhost:8082/api/fleet/dashboard/test");
        System.out.println("🔍 Diagnostic URL: http://localhost:8082/api/diagnostic/check");
        System.out.println("⚠️  Set FORCE_RELOAD = false after confirming dashboard works.");
    }

    private List<User> createDrivers(Long managerId) {
        String[] driverNames = {
            "Rajesh Kumar",
            "Amit Singh",
            "Priya Sharma",
            "Vikram Patel",
            "Suresh Reddy"
        };

        List<User> drivers = new ArrayList<>();
        for (int i = 0; i < driverNames.length; i++) {
            User driver = new User();
            driver.setName(driverNames[i]);
            driver.setEmail("driver" + (i + 1) + "@neurofleetx.com");
            driver.setPassword(passwordEncoder.encode("driver123"));
            driver.setRole("DRIVER");
            driver.setActive(true);
            driver.setFleetManagerId(managerId);
            driver.setPhone("98765432" + (10 + i));
            driver.setLicense("DL" + (1000000000L + i));
            drivers.add(userRepository.save(driver));
        }
        return drivers;
    }

    private List<Vehicle> createVehicles(Long managerId) {
        String[] vehicleNumbers = {
            "TS09AB1234",
            "TS08XY5678",
            "TS10CD9012",
            "TS07EF3456",
            "TS09GH7890",
            "TS08IJ2345",
            "TS10KL6789",
            "TS07MN0123"
        };

        String[] models = {
            "Toyota Innova",
            "Maruti Ertiga",
            "Honda City",
            "Hyundai Creta",
            "Mahindra Scorpio",
            "Tata Nexon",
            "Kia Seltos",
            "MG Hector"
        };

        String[] statuses = {"AVAILABLE", "IN_USE", "AVAILABLE", "IN_USE", "AVAILABLE", "IN_USE", "MAINTENANCE", "AVAILABLE"};

        // Base coordinates for Hyderabad
        double baseLatitude = 17.385044;
        double baseLongitude = 78.486671;

        // Get drivers to assign
        List<User> drivers = userRepository.findByRoleAndFleetManagerId("DRIVER", managerId);

        List<Vehicle> vehicles = new ArrayList<>();
        for (int i = 0; i < vehicleNumbers.length; i++) {
            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleNumber(vehicleNumbers[i]);
            vehicle.setModel(models[i]);
            vehicle.setStatus(statuses[i]);
            vehicle.setFleetManagerId(managerId);
            
            // Assign driver to ALL vehicles (not just IN_USE)
            if (!drivers.isEmpty()) {
                int driverIndex = i % drivers.size();
                vehicle.setAssignedDriverId(drivers.get(driverIndex).getId());
                System.out.println("✅ Assigned driver " + drivers.get(driverIndex).getName() + " to vehicle " + vehicleNumbers[i]);
            }
            
            // Add telemetry data
            vehicle.setLatitude(baseLatitude + (Math.random() * 0.1 - 0.05)); // Random within ~5km
            vehicle.setLongitude(baseLongitude + (Math.random() * 0.1 - 0.05));
            vehicle.setBatteryPercentage(60 + (int)(Math.random() * 40)); // 60-100%
            vehicle.setFuelPercentage(40 + (int)(Math.random() * 60)); // 40-100%
            vehicle.setSpeed(Math.random() * 80); // 0-80 km/h
            vehicles.add(vehicleRepository.save(vehicle));
        }
        return vehicles;
    }

    private List<Trip> createTrips(Long managerId, List<User> drivers, List<Vehicle> vehicles, Random random) {
        List<Trip> trips = new ArrayList<>();
        
        // Create 50 trips
        for (int i = 0; i < 50; i++) {
            Trip trip = new Trip();
            
            // Random driver
            User driver = drivers.get(random.nextInt(drivers.size()));
            trip.setDriverId(driver.getId());
            
            // Random vehicle
            Vehicle vehicle = vehicles.get(random.nextInt(vehicles.size()));
            trip.setVehicleId(vehicle.getId());
            
            // Random status (70% completed, 20% active, 10% cancelled)
            int statusRand = random.nextInt(100);
            if (statusRand < 70) {
                trip.setStatus("COMPLETED");
            } else if (statusRand < 90) {
                trip.setStatus("ACTIVE");
            } else {
                trip.setStatus("CANCELLED");
            }
            
            // Random fare between 300 and 1500
            trip.setFare(300.0 + random.nextDouble() * 1200.0);
            
            trip.setFleetManagerId(managerId);
            
            // Random date in last 30 days
            LocalDateTime createdAt = LocalDateTime.now().minusDays(random.nextInt(30));
            trip.setCreatedAt(createdAt);
            
            if ("COMPLETED".equals(trip.getStatus())) {
                trip.setStartTime(createdAt);
                trip.setEndTime(createdAt.plusHours(random.nextInt(5) + 1));
            } else if ("ACTIVE".equals(trip.getStatus())) {
                // Active trips should have recent start times (within last 5 hours)
                trip.setStartTime(LocalDateTime.now().minusHours(random.nextInt(5)));
            }
            
            trips.add(tripRepository.save(trip));
        }
        return trips;
    }

    private List<Maintenance> createMaintenanceRecords(List<Vehicle> vehicles, Random random) {
        List<Maintenance> maintenanceList = new ArrayList<>();
        String[] descriptions = {
            "Oil Change",
            "Tire Replacement",
            "Brake Service",
            "Engine Checkup",
            "AC Repair",
            "Battery Replacement",
            "General Service",
            "Transmission Service",
            "Wheel Alignment",
            "Suspension Check"
        };
        String[] statuses = {"COMPLETED", "SCHEDULED", "IN_PROGRESS"};

        // Create 2-3 maintenance records per vehicle
        for (Vehicle vehicle : vehicles) {
            int recordCount = 2 + random.nextInt(2); // 2 or 3 records
            for (int i = 0; i < recordCount; i++) {
                Maintenance maintenance = new Maintenance();
                maintenance.setVehicle(vehicle); // Set the Vehicle object, not vehicleId
                maintenance.setDescription(descriptions[random.nextInt(descriptions.length)]);
                maintenance.setCost(500.0 + random.nextDouble() * 4500.0); // 500-5000
                
                LocalDate serviceDate = LocalDate.now().minusDays(random.nextInt(60));
                maintenance.setServiceDate(serviceDate);
                
                // Set next service date 30-90 days after service date
                maintenance.setNextServiceDate(serviceDate.plusDays(30 + random.nextInt(60)));
                
                maintenance.setStatus(statuses[random.nextInt(statuses.length)]);
                maintenanceList.add(maintenanceRepository.save(maintenance));
            }
        }
        return maintenanceList;
    }
}
