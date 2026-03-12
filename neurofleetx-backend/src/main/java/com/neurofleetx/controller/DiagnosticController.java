package com.neurofleetx.controller;

import com.neurofleetx.repository.TripRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/diagnostic")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class DiagnosticController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private TripRepository tripRepository;

    @GetMapping("/check")
    public Map<String, Object> checkDatabase() {
        Map<String, Object> result = new HashMap<>();
        
        result.put("totalUsers", userRepository.count());
        result.put("totalVehicles", vehicleRepository.count());
        result.put("totalTrips", tripRepository.count());
        
        // Check vehicles by fleet manager
        result.put("vehiclesForManager1", vehicleRepository.countByFleetManagerId(1L));
        result.put("vehiclesForManager2", vehicleRepository.countByFleetManagerId(2L));
        
        // Check trips by fleet manager
        result.put("tripsForManager1", tripRepository.findByFleetManagerId(1L).size());
        result.put("tripsForManager2", tripRepository.findByFleetManagerId(2L).size());
        
        // Get all users to see IDs
        result.put("users", userRepository.findAll().stream()
                .map(u -> Map.of(
                    "id", u.getId(),
                    "email", u.getEmail(),
                    "role", u.getRole()
                ))
                .toList());
        
        return result;
    }
}
