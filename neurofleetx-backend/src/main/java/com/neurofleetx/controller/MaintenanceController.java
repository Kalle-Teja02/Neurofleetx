package com.neurofleetx.controller;

import com.neurofleetx.entity.Maintenance;
import com.neurofleetx.entity.User;
import com.neurofleetx.repository.MaintenanceRepository;
import com.neurofleetx.repository.UserRepository;
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

    @GetMapping("/manager/test")
    public ResponseEntity<List<Map<String, Object>>> getMaintenanceForManager() {
        try {
            // Find any MANAGER user
            User manager = userRepository.findAll().stream()
                    .filter(u -> "MANAGER".equals(u.getRole()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No MANAGER found"));
            
            // Get all maintenance records for this fleet manager
            List<Maintenance> maintenanceList = maintenanceRepository.findByFleetManagerId(manager.getId());
            
            // Convert to response format
            List<Map<String, Object>> maintenanceRecords = maintenanceList.stream()
                    .map(maintenance -> {
                        Map<String, Object> record = new HashMap<>();
                        record.put("id", maintenance.getId());
                        record.put("vehicleId", maintenance.getVehicle().getId());
                        record.put("vehicleNumber", maintenance.getVehicle().getVehicleNumber());
                        record.put("type", maintenance.getDescription());
                        record.put("scheduledDate", maintenance.getServiceDate().toString());
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
