package com.neurofleetx.controller;

import com.neurofleetx.entity.User;
import com.neurofleetx.repository.TripRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/diagnostic")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class DiagnosticController {

    @Autowired private UserRepository    userRepository;
    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private TripRepository    tripRepository;
    @Autowired private PasswordEncoder   passwordEncoder;

    @GetMapping("/check")
    public Map<String, Object> checkDatabase() {
        Map<String, Object> result = new HashMap<>();
        result.put("totalUsers",    userRepository.count());
        result.put("totalVehicles", vehicleRepository.count());
        result.put("totalTrips",    tripRepository.count());
        result.put("users", userRepository.findAll().stream()
                .map(u -> Map.of("id", u.getId(), "email", u.getEmail(), "role", u.getRole()))
                .toList());
        return result;
    }

    /** Call this once to create missing seed accounts without restarting the backend */
    @GetMapping("/seed-accounts")
    public Map<String, Object> seedAccounts() {
        Map<String, Object> result = new HashMap<>();
        result.put("admin",    ensureUser("admin@neurofleetx.com",    "admin123",    "Admin",         "ADMIN"));
        result.put("manager",  ensureUser("abc@gmail.com",            "12345",       "Fleet Manager", "MANAGER"));
        result.put("customer", ensureUser("customer@neurofleetx.com", "customer123", "Customer",      "CUSTOMER"));
        return result;
    }

    private String ensureUser(String email, String pwd, String name, String role) {
        if (userRepository.findByEmail(email).isPresent()) return "already exists";
        User u = new User();
        u.setEmail(email); u.setPassword(passwordEncoder.encode(pwd));
        u.setName(name); u.setRole(role); u.setActive(true);
        userRepository.save(u);
        return "created";
    }
}
