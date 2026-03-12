package com.neurofleetx.controller;

import com.neurofleetx.entity.User;
import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;
import com.neurofleetx.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class VehicleController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private UserRepository userRepository;

    // Test endpoint (no auth)
    @GetMapping("/manager/test")
    public ResponseEntity<List<Vehicle>> getVehiclesForManager() {
        try {
            User manager = userRepository.findAll().stream()
                    .filter(u -> "MANAGER".equals(u.getRole()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No MANAGER found"));
            
            List<Vehicle> vehicles = vehicleRepository.findByFleetManagerId(manager.getId());
            
            // Add default telemetry data if missing
            for (Vehicle vehicle : vehicles) {
                boolean needsUpdate = false;
                
                if (vehicle.getLatitude() == null || vehicle.getLatitude() == 0.0) {
                    vehicle.setLatitude(17.385044 + (Math.random() * 0.1 - 0.05));
                    vehicle.setLongitude(78.486671 + (Math.random() * 0.1 - 0.05));
                    vehicle.setBatteryPercentage(60 + (int)(Math.random() * 40));
                    vehicle.setFuelPercentage(40 + (int)(Math.random() * 60));
                    needsUpdate = true;
                }
                
                if (vehicle.getSpeed() == null) {
                    vehicle.setSpeed(Math.random() * 80); // 0-80 km/h
                    needsUpdate = true;
                }
                
                if (needsUpdate) {
                    vehicleRepository.save(vehicle);
                }
            }
            
            System.out.println("✅ Found " + vehicles.size() + " vehicles for manager " + manager.getId());
            
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    // Test endpoint - get all vehicles (no auth)
    @GetMapping("/test")
    public ResponseEntity<List<Vehicle>> getAllVehiclesTest() {
        try {
            List<Vehicle> vehicles = vehicleRepository.findAll();
            System.out.println("✅ Returning " + vehicles.size() + " vehicles");
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    // CRUD Endpoints
    @PostMapping
    public ResponseEntity<Vehicle> addVehicle(@RequestBody Vehicle vehicle) {
        try {
            Vehicle savedVehicle = vehicleService.addVehicle(vehicle);
            return ResponseEntity.ok(savedVehicle);
        } catch (Exception e) {
            System.out.println("❌ Error adding vehicle: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Test endpoint for adding vehicle (no auth required)
    @PostMapping("/test")
    public ResponseEntity<Vehicle> addVehicleTest(@RequestBody Vehicle vehicle) {
        try {
            // Auto-assign to first manager if not set
            if (vehicle.getFleetManagerId() == null) {
                User manager = userRepository.findAll().stream()
                        .filter(u -> "MANAGER".equals(u.getRole()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("No MANAGER found"));
                vehicle.setFleetManagerId(manager.getId());
            }
            
            Vehicle savedVehicle = vehicleService.addVehicle(vehicle);
            System.out.println("✅ Vehicle added: " + savedVehicle.getVehicleNumber() + " for manager " + savedVehicle.getFleetManagerId());
            return ResponseEntity.ok(savedVehicle);
        } catch (Exception e) {
            System.out.println("❌ Error adding vehicle: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        try {
            List<Vehicle> vehicles = vehicleService.getAllVehicles();
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        try {
            return vehicleService.getVehicleById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        try {
            Vehicle updatedVehicle = vehicleService.updateVehicle(id, vehicle);
            return ResponseEntity.ok(updatedVehicle);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Test endpoint for updating vehicle (no auth required)
    @PutMapping("/test/{id}")
    public ResponseEntity<Vehicle> updateVehicleTest(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        try {
            Vehicle updatedVehicle = vehicleService.updateVehicle(id, vehicle);
            System.out.println("✅ Vehicle updated: " + updatedVehicle.getVehicleNumber());
            return ResponseEntity.ok(updatedVehicle);
        } catch (RuntimeException e) {
            System.out.println("❌ Vehicle not found: " + id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("❌ Error updating vehicle: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        try {
            vehicleService.deleteVehicle(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Test endpoint for deleting vehicle (no auth required)
    @DeleteMapping("/test/{id}")
    public ResponseEntity<Void> deleteVehicleTest(@PathVariable Long id) {
        try {
            vehicleService.deleteVehicle(id);
            System.out.println("✅ Vehicle deleted: " + id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            System.out.println("❌ Vehicle not found: " + id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("❌ Error deleting vehicle: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    // Utility endpoint to add telemetry data to existing vehicles
    @PostMapping("/add-telemetry")
    public ResponseEntity<String> addTelemetryToExistingVehicles() {
        try {
            List<Vehicle> vehicles = vehicleRepository.findAll();
            int updated = 0;
            
            for (Vehicle vehicle : vehicles) {
                // Only update if telemetry data is missing
                if (vehicle.getLatitude() == null || vehicle.getLatitude() == 0.0) {
                    vehicle.setLatitude(17.385044 + (Math.random() * 0.1 - 0.05));
                    vehicle.setLongitude(78.486671 + (Math.random() * 0.1 - 0.05));
                    vehicle.setBatteryPercentage(60 + (int)(Math.random() * 40));
                    vehicle.setFuelPercentage(40 + (int)(Math.random() * 60));
                    vehicle.setSpeed(0.0 + Math.random() * 80); // 0-80 km/h
                    vehicleRepository.save(vehicle);
                    updated++;
                }
            }
            
            String message = "✅ Updated " + updated + " vehicles with telemetry data";
            System.out.println(message);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // Filter by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Vehicle>> getVehiclesByStatus(@PathVariable String status) {
        try {
            List<Vehicle> vehicles = vehicleRepository.findByStatus(status);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Get low battery vehicles
    @GetMapping("/low-battery")
    public ResponseEntity<List<Vehicle>> getLowBatteryVehicles() {
        try {
            List<Vehicle> vehicles = vehicleRepository.findByBatteryPercentageLessThan(20);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Get vehicles needing maintenance
    @GetMapping("/maintenance")
    public ResponseEntity<List<Vehicle>> getMaintenanceVehicles() {
        try {
            List<Vehicle> vehicles = vehicleRepository.findByStatus("MAINTENANCE");
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Update telemetry
    @PutMapping("/{id}/telemetry")
    public ResponseEntity<Vehicle> updateTelemetry(@PathVariable Long id, @RequestBody Vehicle telemetryData) {
        try {
            Vehicle vehicle = vehicleRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            
            // Update telemetry fields
            if (telemetryData.getSpeed() != null) vehicle.setSpeed(telemetryData.getSpeed());
            if (telemetryData.getBatteryPercentage() != null) vehicle.setBatteryPercentage(telemetryData.getBatteryPercentage());
            if (telemetryData.getFuelPercentage() != null) vehicle.setFuelPercentage(telemetryData.getFuelPercentage());
            if (telemetryData.getLatitude() != null) vehicle.setLatitude(telemetryData.getLatitude());
            if (telemetryData.getLongitude() != null) vehicle.setLongitude(telemetryData.getLongitude());
            
            Vehicle updated = vehicleRepository.save(vehicle);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Mark vehicle as serviced
    @PutMapping("/{id}/service-complete")
    public ResponseEntity<Vehicle> markAsServiced(@PathVariable Long id) {
        try {
            Vehicle vehicle = vehicleRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            
            // Reset to good condition
            vehicle.setStatus("AVAILABLE");
            vehicle.setBatteryPercentage(100);
            vehicle.setFuelPercentage(100);
            vehicle.setSpeed(0.0);
            
            Vehicle updated = vehicleRepository.save(vehicle);
            System.out.println("✅ Vehicle " + vehicle.getVehicleNumber() + " serviced and marked as AVAILABLE");
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
