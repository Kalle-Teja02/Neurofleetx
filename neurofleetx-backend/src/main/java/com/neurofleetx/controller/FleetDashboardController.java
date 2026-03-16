package com.neurofleetx.controller;

import com.neurofleetx.dto.FleetDashboardResponse;
import com.neurofleetx.entity.User;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.service.FleetDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fleet")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class FleetDashboardController {

    @Autowired
    private FleetDashboardService fleetDashboardService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<FleetDashboardResponse> getFleetDashboard() {
        try {
            // Get logged-in user from SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("❌ No authentication found");
                return ResponseEntity.status(403).build();
            }
            
            String email = authentication.getName();
            System.out.println("✅ Authenticated user: " + email);
            
            // Fetch user from database
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
            
            System.out.println("✅ Found user: ID=" + user.getId() + ", Role=" + user.getRole());
            
            // Get dashboard data for this user's ID
            FleetDashboardResponse response = fleetDashboardService.getFleetDashboard(user.getId());
            System.out.println("✅ Dashboard data retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // Temporary test endpoint WITHOUT authentication
    @GetMapping("/dashboard/test")
    public ResponseEntity<FleetDashboardResponse> getFleetDashboardTest() {
        try {
            System.out.println("🔍 Test endpoint called - no auth required");
            
            // Find manager with email abc@gmail.com
            User manager = userRepository.findByEmail("abc@gmail.com")
                    .orElseThrow(() -> new RuntimeException("Manager abc@gmail.com not found"));
            
            System.out.println("✅ Using MANAGER: " + manager.getEmail());
            
            // Get dashboard data
            FleetDashboardResponse response = fleetDashboardService.getFleetDashboard(manager.getId());
            System.out.println("✅ Dashboard data retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Keep old endpoint for backward compatibility
    @GetMapping("/dashboard/{fleetManagerId}")
    public ResponseEntity<FleetDashboardResponse> getFleetDashboardById(@PathVariable Long fleetManagerId) {
        FleetDashboardResponse response = fleetDashboardService.getFleetDashboard(fleetManagerId);
        return ResponseEntity.ok(response);
    }
}
