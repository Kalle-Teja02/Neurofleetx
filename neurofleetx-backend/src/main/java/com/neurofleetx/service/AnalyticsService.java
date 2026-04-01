package com.neurofleetx.service;

import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.repository.TripRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private TripRepository    tripRepository;
    @Autowired private UserRepository    userRepository;

    /** Full fleet analytics — for ADMIN and FLEET_MANAGER */
    public Map<String, Object> getAllFleetData() {
        List<Vehicle> all = vehicleRepository.findAll();
        return buildAnalytics(all, true);
    }

    /** Driver-scoped analytics — only the vehicle assigned to this driver */
    public Map<String, Object> getDriverVehicleData(Long userId) {
        return userRepository.findById(userId).map(driver -> {
            if (driver.getVehicleId() == null) return emptyDriverData();
            return vehicleRepository.findById(driver.getVehicleId())
                    .map(v -> buildAnalytics(List.of(v), false))
                    .orElse(emptyDriverData());
        }).orElse(emptyDriverData());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Map<String, Object> buildAnalytics(List<Vehicle> vehicles, boolean fullFleet) {
        Map<String, Object> data = new LinkedHashMap<>();

        // Vehicle status breakdown (for pie chart)
        Map<String, Long> statusCount = vehicles.stream()
                .collect(Collectors.groupingBy(Vehicle::getStatus, Collectors.counting()));
        data.put("statusBreakdown", statusCount);

        // KPIs
        data.put("totalVehicles", vehicles.size());
        data.put("available",    statusCount.getOrDefault("AVAILABLE", 0L));
        data.put("inUse",        statusCount.getOrDefault("IN_USE", 0L));
        data.put("maintenance",  statusCount.getOrDefault("MAINTENANCE", 0L));

        // Average battery & fuel
        OptionalDouble avgBattery = vehicles.stream()
                .filter(v -> v.getBatteryPercentage() != null)
                .mapToInt(Vehicle::getBatteryPercentage).average();
        OptionalDouble avgFuel = vehicles.stream()
                .filter(v -> v.getFuelPercentage() != null)
                .mapToInt(Vehicle::getFuelPercentage).average();
        data.put("avgBattery", avgBattery.isPresent() ? Math.round(avgBattery.getAsDouble()) : 0);
        data.put("avgFuel",    avgFuel.isPresent()    ? Math.round(avgFuel.getAsDouble())    : 0);

        // Vehicle list (summary)
        List<Map<String, Object>> vehicleList = vehicles.stream().map(v -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",            v.getId());
            m.put("vehicleNumber", v.getVehicleNumber());
            m.put("model",         v.getModel());
            m.put("status",        v.getStatus());
            m.put("battery",       v.getBatteryPercentage());
            m.put("fuel",          v.getFuelPercentage());
            m.put("speed",         v.getSpeed());
            return m;
        }).collect(Collectors.toList());
        data.put("vehicles", vehicleList);

        if (fullFleet) {
            // Fleet-wide trip stats
            long totalTrips = tripRepository.count();
            data.put("totalTrips", totalTrips);

            // Driver count
            long driverCount = userRepository.findAll().stream()
                    .filter(u -> "DRIVER".equals(u.getRole())).count();
            data.put("totalDrivers", driverCount);

            // Low battery / fuel alerts
            long lowBattery = vehicles.stream()
                    .filter(v -> v.getBatteryPercentage() != null && v.getBatteryPercentage() < 30).count();
            long lowFuel = vehicles.stream()
                    .filter(v -> v.getFuelPercentage() != null && v.getFuelPercentage() < 20).count();
            data.put("lowBatteryCount", lowBattery);
            data.put("lowFuelCount",    lowFuel);
        }

        data.put("isFullFleet", fullFleet);
        return data;
    }

    private Map<String, Object> emptyDriverData() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalVehicles", 0);
        m.put("vehicles", Collections.emptyList());
        m.put("isFullFleet", false);
        m.put("message", "No vehicle assigned to this driver");
        return m;
    }
}
