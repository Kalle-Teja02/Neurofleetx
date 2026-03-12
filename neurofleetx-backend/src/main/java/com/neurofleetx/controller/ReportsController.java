package com.neurofleetx.controller;

import com.neurofleetx.entity.User;
import com.neurofleetx.repository.TripRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class ReportsController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/manager/test")
    public ResponseEntity<Map<String, Object>> getReportsForManager() {
        try {
            // Find any MANAGER user
            User manager = userRepository.findAll().stream()
                    .filter(u -> "MANAGER".equals(u.getRole()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No MANAGER found"));
            
            Long managerId = manager.getId();
            
            Map<String, Object> reports = new HashMap<>();
            
            // Calculate statistics
            Double totalRevenue = tripRepository.sumFareByFleetManagerIdAndStatusCompleted(managerId);
            reports.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
            
            Long totalTrips = (long) tripRepository.findByFleetManagerId(managerId).size();
            reports.put("totalTrips", totalTrips);
            
            Long completedTrips = tripRepository.countByFleetManagerIdAndStatus(managerId, "COMPLETED");
            reports.put("completedTrips", completedTrips);
            
            Long cancelledTrips = tripRepository.countByFleetManagerIdAndStatus(managerId, "CANCELLED");
            reports.put("cancelledTrips", cancelledTrips);
            
            Long activeTrips = tripRepository.countByFleetManagerIdAndStatus(managerId, "ACTIVE");
            reports.put("activeTrips", activeTrips);
            
            Long totalVehicles = vehicleRepository.countByFleetManagerId(managerId);
            reports.put("totalVehicles", totalVehicles);
            
            Long totalDrivers = userRepository.countByRoleAndFleetManagerId("DRIVER", managerId);
            reports.put("totalDrivers", totalDrivers);
            
            System.out.println("✅ Generated reports for manager " + managerId);
            
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
