package com.neurofleetx.controller;

import com.neurofleetx.entity.Trip;
import com.neurofleetx.entity.User;
import com.neurofleetx.repository.TripRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class TripManagementController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TripService tripService;

    @GetMapping("/manager/test")
    public ResponseEntity<List<Trip>> getTripsForManager() {
        try {
            // Find any MANAGER user
            User manager = userRepository.findAll().stream()
                    .filter(u -> "MANAGER".equals(u.getRole()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No MANAGER found"));
            
            List<Trip> trips = tripRepository.findByFleetManagerId(manager.getId());
            System.out.println("✅ Found " + trips.size() + " trips for manager " + manager.getId());
            
            return ResponseEntity.ok(trips);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
    
    @PostMapping("/test/start")
    public ResponseEntity<?> startTrip(@RequestBody Map<String, Long> request) {
        try {
            Long driverId = request.get("driverId");
            Long vehicleId = request.get("vehicleId");
            
            System.out.println("🚗 Starting trip - Driver: " + driverId + ", Vehicle: " + vehicleId);
            
            Trip trip = tripService.startTrip(driverId, vehicleId);
            System.out.println("✅ Trip started successfully: " + trip.getId());
            
            return ResponseEntity.ok(trip);
        } catch (Exception e) {
            System.out.println("❌ Error starting trip: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/test/end/{tripId}")
    public ResponseEntity<?> endTrip(@PathVariable Long tripId) {
        try {
            System.out.println("🏁 Ending trip: " + tripId);
            
            Trip trip = tripService.endTrip(tripId);
            System.out.println("✅ Trip ended successfully");
            
            return ResponseEntity.ok(trip);
        } catch (Exception e) {
            System.out.println("❌ Error ending trip: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/test/driver/{driverId}")
    public ResponseEntity<List<Trip>> getTripsByDriver(@PathVariable Long driverId) {
        try {
            List<Trip> trips = tripService.getTripsByDriver(driverId);
            System.out.println("✅ Found " + trips.size() + " trips for driver " + driverId);
            return ResponseEntity.ok(trips);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/test/active/{driverId}")
    public ResponseEntity<?> getActiveTrip(@PathVariable Long driverId) {
        try {
            Trip trip = tripService.getActiveTrip(driverId);
            if (trip == null) {
                return ResponseEntity.ok(Map.of("message", "No active trip"));
            }
            return ResponseEntity.ok(trip);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/test/active")
    public ResponseEntity<List<Trip>> getAllActiveTrips() {
        try {
            List<Trip> trips = tripService.getActiveTrips();
            System.out.println("✅ Found " + trips.size() + " active trips");
            return ResponseEntity.ok(trips);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
