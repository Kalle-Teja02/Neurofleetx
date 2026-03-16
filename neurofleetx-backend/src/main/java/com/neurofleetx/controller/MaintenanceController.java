package com.neurofleetx.controller;

import com.neurofleetx.entity.Maintenance;
import com.neurofleetx.entity.User;
import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.repository.MaintenanceRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class MaintenanceController {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping("/test")
    public ResponseEntity<List<Map<String, Object>>> getMaintenanceForManager() {
        try {
            // Find manager with email abc@gmail.com
            User manager = userRepository.findByEmail("abc@gmail.com")
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            
            System.out.println("🔍 Found manager: " + manager.getEmail() + " (ID: " + manager.getId() + ")");
            
            // Get all vehicles for this manager
            List<Vehicle> vehicles = vehicleRepository.findByFleetManagerId(manager.getId());
            System.out.println("🚗 Found " + vehicles.size() + " vehicles for manager");
            
            // Get all maintenance records for these vehicles
            List<Maintenance> maintenanceList = new ArrayList<>();
            for (Vehicle vehicle : vehicles) {
                List<Maintenance> vehicleMaintenance = maintenanceRepository.findByVehicle(vehicle);
                maintenanceList.addAll(vehicleMaintenance);
            }
            
            // Convert to response format
            List<Map<String, Object>> maintenanceRecords = maintenanceList.stream()
                    .map(maintenance -> {
                        Map<String, Object> record = new HashMap<>();
                        record.put("id", maintenance.getId());
                        record.put("vehicleId", maintenance.getVehicle().getId());
                        record.put("vehicleNumber", maintenance.getVehicle().getVehicleNumber());
                        record.put("vehicle", new HashMap<String, Object>() {{
                            put("id", maintenance.getVehicle().getId());
                            put("vehicleNumber", maintenance.getVehicle().getVehicleNumber());
                        }});
                        record.put("type", maintenance.getDescription());
                        record.put("serviceDate", maintenance.getServiceDate().toString());
                        record.put("nextServiceDate", maintenance.getNextServiceDate() != null ? 
                                    maintenance.getNextServiceDate().toString() : null);
                        record.put("status", maintenance.getStatus());
                        record.put("cost", maintenance.getCost());
                        record.put("description", maintenance.getDescription());
                        return record;
                    })
                    .collect(Collectors.toList());
            
            System.out.println("✅ Found " + maintenanceRecords.size() + " maintenance records");
            
            return ResponseEntity.ok(maintenanceRecords);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
