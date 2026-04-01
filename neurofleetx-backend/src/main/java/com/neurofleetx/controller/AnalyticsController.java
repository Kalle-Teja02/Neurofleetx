package com.neurofleetx.controller;

import com.neurofleetx.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * GET /api/analytics?role=ADMIN&userId=1
     * GET /api/analytics?role=FLEET_MANAGER&userId=2
     * GET /api/analytics?role=DRIVER&userId=5
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics(
            @RequestParam String role,
            @RequestParam Long userId) {

        Map<String, Object> data;

        if ("DRIVER".equalsIgnoreCase(role)) {
            data = analyticsService.getDriverVehicleData(userId);
        } else {
            // ADMIN or FLEET_MANAGER → full fleet
            data = analyticsService.getAllFleetData();
        }

        return ResponseEntity.ok(data);
    }
}
