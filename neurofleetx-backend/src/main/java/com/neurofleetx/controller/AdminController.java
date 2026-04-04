package com.neurofleetx.controller;

import com.neurofleetx.service.AdminAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class AdminController {

    @Autowired
    private AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(adminAnalyticsService.getAnalytics());
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<Map<String, Object>>> getVehicles() {
        return ResponseEntity.ok(adminAnalyticsService.getVehicles());
    }

    @GetMapping("/trips")
    public ResponseEntity<List<Map<String, Object>>> getTrips() {
        return ResponseEntity.ok(adminAnalyticsService.getTrips());
    }
}
