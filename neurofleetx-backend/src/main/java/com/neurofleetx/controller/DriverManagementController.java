package com.neurofleetx.controller;

import com.neurofleetx.entity.User;
import com.neurofleetx.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class DriverManagementController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/manager/test")
    public ResponseEntity<List<User>> getDriversForManager() {
        try {
            // Get the authenticated user from the request
            // For now, find the manager with email abc@gmail.com
            User manager = userRepository.findByEmail("abc@gmail.com")
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            
            List<User> drivers = userRepository.findByRoleAndFleetManagerId("DRIVER", manager.getId());
            System.out.println("✅ Found " + drivers.size() + " drivers for manager " + manager.getId());
            
            return ResponseEntity.ok(drivers);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
    
    @PutMapping("/manager/test/{driverId}/assign/{vehicleId}")
    public ResponseEntity<String> assignDriverToVehicle(
            @PathVariable Long driverId,
            @PathVariable Long vehicleId) {
        try {
            System.out.println("🔍 Assigning driver " + driverId + " to vehicle " + vehicleId);
            
            // Find the driver
            User driver = userRepository.findById(driverId)
                    .orElseThrow(() -> new RuntimeException("Driver not found"));
            
            // Verify driver role
            if (!"DRIVER".equals(driver.getRole())) {
                return ResponseEntity.badRequest().body("User is not a driver");
            }
            
            // Assign vehicle to driver
            driver.setVehicleId(vehicleId);
            userRepository.save(driver);
            
            String message = "Driver " + driver.getName() + " successfully assigned to vehicle " + vehicleId;
            System.out.println("✅ " + message);
            
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to assign driver: " + e.getMessage());
        }
    }
}
