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
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@Profile("!test")
public class SafeDataLoader implements CommandLineRunner {

    @Autowired private VehicleRepository     vehicleRepository;
    @Autowired private TripRepository        tripRepository;
    @Autowired private UserRepository        userRepository;
    @Autowired private MaintenanceRepository maintenanceRepository;
    @Autowired private PasswordEncoder       passwordEncoder;

    private static final boolean FORCE_RELOAD = true;

    private static final double[][] HOTSPOTS = {
        {17.3850, 78.4867}, {17.4399, 78.4983}, {17.4126, 78.4071},
        {17.3616, 78.4747}, {17.4947, 78.3996}, {17.3753, 78.5011},
        {17.4239, 78.4738}, {17.3297, 78.5519}
    };

    @Override
    public void run(String... args) throws Exception {
        ensureSeedAccounts();
        if (!FORCE_RELOAD) {
            System.out.println("Data loading skipped (FORCE_RELOAD = false)");
            return;
        }
        Random random = new Random();
        User fleetManager = userRepository.findByEmail("abc@gmail.com").orElseThrow();
        Long managerId = fleetManager.getId();
        maintenanceRepository.deleteAll();
        tripRepository.deleteAll();
        vehicleRepository.deleteAll();
        userRepository.deleteAll(userRepository.findByRole("DRIVER"));
        List<User>    drivers  = createDrivers(managerId);
        List<Vehicle> vehicles = createVehicles(managerId);
        List<Trip>    trips    = createTrips(managerId, drivers, vehicles, random);
        createMaintenanceRecords(vehicles, random);
        System.out.println("SafeDataLoader complete — trips: " + trips.size());
    }

    private void ensureSeedAccounts() {
        createUserIfMissing("admin@neurofleetx.com",    "admin123",    "Admin",         "ADMIN");
        createUserIfMissing("abc@gmail.com",            "12345",       "Fleet Manager", "MANAGER");
        createUserIfMissing("customer@neurofleetx.com", "customer123", "Priya Sharma",  "CUSTOMER");
        createUserIfMissing("customer2@neurofleetx.com","customer123", "Ananya Reddy",  "CUSTOMER");
        createUserIfMissing("customer3@neurofleetx.com","customer123", "Meera Patel",   "CUSTOMER");
    }

    private void createUserIfMissing(String email, String pwd, String name, String role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User u = new User();
            u.setEmail(email); u.setPassword(passwordEncoder.encode(pwd));
            u.setName(name); u.setRole(role); u.setActive(true);
            userRepository.save(u);
            System.out.println("Created seed account: " + email);
        }
    }

    private List<User> createDrivers(Long managerId) {
        String[] names = {
            "Rajesh Kumar","Amit Singh","Priya Sharma","Vikram Patel","Suresh Reddy",
            "Kiran Kumar","Sanjay Gupta","Deepak Verma","Ramesh Naidu","Anil Rao"
        };
        List<User> drivers = new ArrayList<>();
        for (int i = 0; i < names.length; i++) {
            User d = new User();
            d.setName(names[i]);
            d.setEmail("driver" + (i+1) + "@neurofleetx.com");
            d.setPassword(passwordEncoder.encode("driver123"));
            d.setRole("DRIVER"); d.setActive(true);
            d.setFleetManagerId(managerId);
            d.setPhone("98765432" + (10+i));
            drivers.add(userRepository.save(d));
        }
        return drivers;
    }

    private List<Vehicle> createVehicles(Long managerId) {
        String[] numbers = {
            "TS09AB1234","TS08XY5678","TS10CD9012","TS07EF3456","TS09GH7890",
            "TS08IJ2345","TS10KL6789","TS07MN0123","TS09OP4567","TS08QR8901",
            "TS10ST2345","TS07UV6789","TS09WX0123","TS08YZ4567","TS10AB8901",
            "TS07CD2345","TS09EF6789","TS08GH0123","TS10IJ4567","TS07KL8901",
            "TS09MN2345","TS08OP6789","TS10QR0123","TS07ST4567","TS09UV8901",
            "TS08WX2345","TS10YZ6789","TS07AB0123","TS09CD4567","TS08EF8901",
            "TS10GH2345","TS07IJ6789","TS09KL0123","TS08MN4567","TS10OP8901",
            "TS07QR2345","TS09ST6789","TS08UV0123","TS10WX4567","TS07YZ8901",
            "TS09AB2345","TS08CD6789","TS10EF0123","TS07GH4567","TS09IJ8901"
        };
        String[] models = {
            "Toyota Innova","Maruti Ertiga","Honda City","Hyundai Creta","Mahindra Scorpio",
            "Tata Nexon","Kia Seltos","MG Hector","Toyota Fortuner","Maruti Swift",
            "Honda Accord","Hyundai Venue","Mahindra XUV500","Tata Harrier","Kia Sonet",
            "MG Astor","Toyota Camry","Maruti Baleno","Honda Jazz","Hyundai i20",
            "Mahindra Bolero","Tata Altroz","Kia Carens","MG ZS EV","Toyota Fortuner",
            "Maruti Ciaz","Honda CR-V","Hyundai Creta","Mahindra XUV300","Tata Nexon EV",
            "Kia Niro","MG Hector Plus","Toyota Innova","Maruti Ertiga","Honda City",
            "Hyundai Venue","Mahindra Scorpio","Tata Nexon","Kia Seltos","MG Astor",
            "Toyota Camry","Maruti Swift","Honda Accord","Hyundai i20","Mahindra Bolero"
        };
        String[] statuses = {"AVAILABLE","IN_USE","MAINTENANCE","AVAILABLE","IN_USE"};
        List<User> drivers = userRepository.findByRoleAndFleetManagerId("DRIVER", managerId);
        List<Vehicle> vehicles = new ArrayList<>();
        Random rnd = new Random();
        for (int i = 0; i < numbers.length; i++) {
            Vehicle v = new Vehicle();
            v.setVehicleNumber(numbers[i]); v.setModel(models[i]);
            v.setStatus(statuses[i % statuses.length]); v.setFleetManagerId(managerId);
            if (!drivers.isEmpty()) v.setAssignedDriverId(drivers.get(i % drivers.size()).getId());
            double[] hs = HOTSPOTS[rnd.nextInt(HOTSPOTS.length)];
            v.setLatitude(hs[0]  + (rnd.nextDouble()-0.5)*0.05);
            v.setLongitude(hs[1] + (rnd.nextDouble()-0.5)*0.05);
            v.setBatteryPercentage(60 + rnd.nextInt(40));
            v.setFuelPercentage(40 + rnd.nextInt(60));
            v.setSpeed(rnd.nextDouble() * 80);
            vehicles.add(vehicleRepository.save(v));
        }
        return vehicles;
    }

    private List<Trip> createTrips(Long managerId, List<User> drivers, List<Vehicle> vehicles, Random rnd) {
        int[] hourWeights = {1,1,1,1,1,2,3,5,8,6,4,3,4,4,4,5,8,7,5,4,3,2,2,1};
        int totalWeight = 0;
        for (int w : hourWeights) totalWeight += w;
        List<Trip> trips = new ArrayList<>();
        
        // Create more trips for better data distribution
        for (int i = 0; i < 500; i++) {
            Trip t = new Trip();
            t.setDriverId(drivers.get(rnd.nextInt(drivers.size())).getId());
            t.setVehicleId(vehicles.get(rnd.nextInt(vehicles.size())).getId());
            t.setFleetManagerId(managerId);
            
            // Status distribution: 75% completed, 15% active, 10% cancelled
            int sr = rnd.nextInt(100);
            if (sr < 75) t.setStatus("COMPLETED");
            else if (sr < 90) t.setStatus("ACTIVE");
            else t.setStatus("CANCELLED");
            
            // More realistic fare distribution
            double baseFare = 250.0 + rnd.nextDouble() * 1500.0;
            t.setFare(Math.round(baseFare * 100.0) / 100.0);
            
            // Date distribution: 60% last 7 days, 40% older
            int daysAgo = rnd.nextInt(100) < 60 ? rnd.nextInt(7) : 7 + rnd.nextInt(23);
            
            // Hour selection based on weights
            int pick = rnd.nextInt(totalWeight), cum = 0, hour = 0;
            for (int h = 0; h < 24; h++) { cum += hourWeights[h]; if (pick < cum) { hour = h; break; } }
            
            LocalDateTime createdAt = LocalDateTime.now().minusDays(daysAgo).withHour(hour).withMinute(rnd.nextInt(60));
            t.setCreatedAt(createdAt);
            
            if ("COMPLETED".equals(t.getStatus())) {
                t.setStartTime(createdAt);
                t.setEndTime(createdAt.plusMinutes(25 + rnd.nextInt(120)));
            } else if ("ACTIVE".equals(t.getStatus())) {
                t.setStartTime(LocalDateTime.now().minusHours(rnd.nextInt(3)));
            }
            
            double[] pu = HOTSPOTS[rnd.nextInt(HOTSPOTS.length)];
            double[] dr = HOTSPOTS[rnd.nextInt(HOTSPOTS.length)];
            t.setPickupLat(pu[0] + (rnd.nextDouble()-0.5)*0.04);
            t.setPickupLng(pu[1] + (rnd.nextDouble()-0.5)*0.04);
            t.setDropLat(dr[0]   + (rnd.nextDouble()-0.5)*0.04);
            t.setDropLng(dr[1]   + (rnd.nextDouble()-0.5)*0.04);
            trips.add(tripRepository.save(t));
        }
        return trips;
    }

    private void createMaintenanceRecords(List<Vehicle> vehicles, Random rnd) {
        String[] descs = {"Oil Change","Tire Replacement","Brake Service","Engine Checkup","AC Repair","Battery Replacement","General Service","Transmission Service","Wheel Alignment","Suspension Check"};
        String[] statuses = {"COMPLETED","SCHEDULED","IN_PROGRESS"};
        for (Vehicle v : vehicles) {
            int count = 2 + rnd.nextInt(2);
            for (int i = 0; i < count; i++) {
                Maintenance m = new Maintenance();
                m.setVehicle(v); m.setDescription(descs[rnd.nextInt(descs.length)]);
                m.setCost(500.0 + rnd.nextDouble() * 4500.0);
                LocalDate sd = LocalDate.now().minusDays(rnd.nextInt(60));
                m.setServiceDate(sd); m.setNextServiceDate(sd.plusDays(30 + rnd.nextInt(60)));
                m.setStatus(statuses[rnd.nextInt(statuses.length)]);
                maintenanceRepository.save(m);
            }
        }
    }
}
