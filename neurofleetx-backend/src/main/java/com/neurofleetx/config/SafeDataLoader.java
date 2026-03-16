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
        
        // 1️⃣ Find or create Fleet Manager with credentials abc@gmail.com / 12345
        User fleetManager = userRepository.findByEmail("abc@gmail.com").orElse(null);
        
        if (fleetManager == null) {
            System.out.println("💡 Creating default Fleet Manager...");
            fleetManager = new User();
            fleetManager.setEmail("abc@gmail.com");
            fleetManager.setPassword(passwordEncoder.encode("12345"));
            fleetManager.setName("Fleet Manager");
            fleetManager.setRole("MANAGER");
            fleetManager.setActive(true);
            fleetManager.setPhone("9876543210");
            fleetManager = userRepository.save(fleetManager);
            System.out.println("✅ Created new Fleet Manager with email: abc@gmail.com");
        } else {
            // Update password to ensure it matches
            System.out.println("✅ Found existing Fleet Manager: " + fleetManager.getEmail());
            fleetManager.setPassword(passwordEncoder.encode("12345"));
            fleetManager = userRepository.save(fleetManager);
            System.out.println("✅ Updated password for Fleet Manager");
        }
        
        Long managerId = fleetManager.getId();
        System.out.println("🔍 Fleet Manager ID: " + managerId + " (" + fleetManager.getEmail() + ")");
        
        // 2️⃣ Clear existing data
        System.out.println("🔥 Clearing existing data...");
        maintenanceRepository.deleteAll();
        tripRepository.deleteAll();
        vehicleRepository.deleteAll();
        
        // Delete all drivers (not just dummy ones)
        List<User> allDrivers = userRepository.findByRole("DRIVER");
        if (!allDrivers.isEmpty()) {
            userRepository.deleteAll(allDrivers);
            System.out.println("✅ Cleared " + allDrivers.size() + " drivers");
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
            User savedDriver = userRepository.save(driver);
            System.out.println("✅ Created driver: " + savedDriver.getName() + " (ID: " + savedDriver.getId() + ", ManagerID: " + savedDriver.getFleetManagerId() + ")");
            drivers.add(savedDriver);
        }
        return drivers;
    }

    private List<Vehicle> createVehicles(Long managerId) {
        String[] vehicleNumbers = {
            "TS09AB1234", "TS08XY5678", "TS10CD9012", "TS07EF3456", "TS09GH7890", "TS08IJ2345", "TS10KL6789", "TS07MN0123",
            "TS09OP4567", "TS08QR8901", "TS10ST2345", "TS07UV6789", "TS09WX0123", "TS08YZ4567", "TS10AB8901", "TS07CD2345",
            "TS09EF6789", "TS08GH0123", "TS10IJ4567", "TS07KL8901", "TS09MN2345", "TS08OP6789", "TS10QR0123", "TS07ST4567",
            "TS09UV8901", "TS08WX2345", "TS10YZ6789", "TS07AB0123", "TS09CD4567", "TS08EF8901", "TS10GH2345", "TS07IJ6789",
            "TS09KL0123", "TS08MN4567", "TS10OP8901", "TS07QR2345", "TS09ST6789", "TS08UV0123", "TS10WX4567", "TS07YZ8901",
            "TS09AB2345", "TS08CD6789", "TS10EF0123", "TS07GH4567", "TS09IJ8901"
        };

        String[] models = {
            "Toyota Innova", "Maruti Ertiga", "Honda City", "Hyundai Creta", "Mahindra Scorpio", "Tata Nexon", "Kia Seltos", "MG Hector",
            "Toyota Fortuner", "Maruti Swift", "Honda Accord", "Hyundai Venue", "Mahindra XUV500", "Tata Harrier", "Kia Sonet", "MG Astor",
            "Toyota Camry", "Maruti Baleno", "Honda Jazz", "Hyundai i20", "Mahindra Bolero", "Tata Altroz", "Kia Carens", "MG ZS EV",
            "Toyota Fortuner", "Maruti Ciaz", "Honda CR-V", "Hyundai Creta", "Mahindra XUV300", "Tata Nexon EV", "Kia Niro", "MG Hector Plus",
            "Toyota Innova", "Maruti Ertiga", "Honda City", "Hyundai Venue", "Mahindra Scorpio", "Tata Nexon", "Kia Seltos", "MG Astor",
            "Toyota Camry", "Maruti Swift", "Honda Accord", "Hyundai i20", "Mahindra Bolero"
        };

        String[] statuses = new String[45];
        for (int i = 0; i < 45; i++) {
            statuses[i] = i % 3 == 0 ? "MAINTENANCE" : (i % 2 == 0 ? "AVAILABLE" : "IN_USE");
        }

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
