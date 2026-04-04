package com.neurofleetx.service;

import com.neurofleetx.entity.Trip;
import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.repository.TripRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminAnalyticsService {

    @Autowired private TripRepository    tripRepository;
    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private UserRepository    userRepository;

    public Map<String, Object> getAnalytics() {
        List<Trip>    trips    = tripRepository.findAll();
        List<Vehicle> vehicles = vehicleRepository.findAll();

        long totalTrips     = trips.size();
        long completedTrips = trips.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        long activeTrips    = trips.stream().filter(t -> "ACTIVE".equals(t.getStatus())).count();
        long cancelledTrips = trips.stream().filter(t -> "CANCELLED".equals(t.getStatus())).count();

        double totalRevenue = trips.stream()
                .filter(t -> "COMPLETED".equals(t.getStatus()))
                .mapToDouble(Trip::getFare).sum();

        double avgFare = completedTrips > 0 ? totalRevenue / completedTrips : 0;

        // Trips today
        LocalDate today = LocalDate.now();
        long tripsToday = trips.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().toLocalDate().equals(today))
                .count();

        // Hourly activity (0-23) — rush-hour weighted
        long[] hourly = new long[24];
        for (Trip t : trips) {
            if (t.getCreatedAt() != null) {
                int h = t.getCreatedAt().getHour();
                hourly[h]++;
            }
        }

        // Vehicle type distribution by model brand prefix
        Map<String, Long> vehicleTypes = vehicles.stream()
                .collect(Collectors.groupingBy(v -> {
                    String model = v.getModel() != null ? v.getModel() : "Unknown";
                    return model.split(" ")[0]; // brand prefix
                }, Collectors.counting()));

        // Trips + Revenue over last 7 days (use endTime for completed, createdAt otherwise)
        List<Map<String, Object>> tripsOverTime = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            final LocalDate d = day;
            long dayTrips = trips.stream().filter(t -> {
                LocalDateTime ref = "COMPLETED".equals(t.getStatus()) && t.getEndTime() != null
                        ? t.getEndTime() : t.getCreatedAt();
                return ref != null && ref.toLocalDate().equals(d);
            }).count();
            double dayRevenue = trips.stream()
                    .filter(t -> "COMPLETED".equals(t.getStatus()) && t.getEndTime() != null
                            && t.getEndTime().toLocalDate().equals(d))
                    .mapToDouble(Trip::getFare).sum();
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", day.toString());
            entry.put("trips", dayTrips);
            entry.put("revenue", Math.round(dayRevenue));
            tripsOverTime.add(entry);
        }

        // Fleet status
        Map<String, Long> fleetStatus = vehicles.stream()
                .collect(Collectors.groupingBy(Vehicle::getStatus, Collectors.counting()));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalFleet",     vehicles.size());
        result.put("totalTrips",     totalTrips);
        result.put("tripsToday",     tripsToday);
        result.put("activeRoutes",   activeTrips);
        result.put("totalRevenue",   Math.round(totalRevenue));
        result.put("completedTrips", completedTrips);
        result.put("cancelledTrips", cancelledTrips);
        result.put("avgFare",        Math.round(avgFare));
        result.put("hourlyActivity", hourly);
        result.put("vehicleTypeDistribution", vehicleTypes);
        result.put("tripsOverTime",  tripsOverTime);
        result.put("fleetStatus",    fleetStatus);
        result.put("totalDrivers",   userRepository.findAll().stream()
                .filter(u -> "DRIVER".equals(u.getRole())).count());
        return result;
    }

    public List<Map<String, Object>> getVehicles() {
        return vehicleRepository.findAll().stream().map(v -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",            v.getId());
            m.put("vehicleNumber", v.getVehicleNumber());
            m.put("model",         v.getModel());
            m.put("status",        v.getStatus());
            m.put("lat",           v.getLatitude());
            m.put("lng",           v.getLongitude());
            m.put("speed",         v.getSpeed());
            m.put("battery",       v.getBatteryPercentage());
            m.put("fuel",          v.getFuelPercentage());
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTrips() {
        return tripRepository.findAll().stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",         t.getId());
            m.put("status",     t.getStatus());
            m.put("fare",       t.getFare());
            m.put("createdAt",  t.getCreatedAt() != null ? t.getCreatedAt().toString() : null);
            m.put("endTime",    t.getEndTime()   != null ? t.getEndTime().toString()   : null);
            m.put("pickupLat",  t.getPickupLat());
            m.put("pickupLng",  t.getPickupLng());
            m.put("dropLat",    t.getDropLat());
            m.put("dropLng",    t.getDropLng());
            return m;
        }).collect(Collectors.toList());
    }
}
