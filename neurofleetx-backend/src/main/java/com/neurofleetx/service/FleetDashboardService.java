package com.neurofleetx.service;

import com.neurofleetx.dto.FleetDashboardResponse;
import com.neurofleetx.dto.RecentTripDTO;
import com.neurofleetx.entity.Role;
import com.neurofleetx.entity.Trip;
import com.neurofleetx.entity.User;
import com.neurofleetx.repository.TripRepository;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FleetDashboardService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Main method to get complete fleet dashboard data
     */
    public FleetDashboardResponse getFleetDashboard(Long fleetManagerId) {
        // Calculate total revenue from completed trips
        Double totalRevenue = tripRepository.sumFareByFleetManagerIdAndStatusCompleted(fleetManagerId);
        if (totalRevenue == null) {
            totalRevenue = 0.0;
        }

        // Count active trips
        Long activeTrips = tripRepository.countByFleetManagerIdAndStatus(fleetManagerId, "ACTIVE");

        // Count total vehicles
        Long totalVehicles = vehicleRepository.countByFleetManagerId(fleetManagerId);

        // Count active drivers
        Long activeDrivers = userRepository.countByRoleAndFleetManagerIdAndActiveTrue("DRIVER", fleetManagerId);

        // Calculate average trip revenue
        Double averageTripRevenue = calculateAverageTripRevenue(fleetManagerId);

        // Find top performing driver
        String topDriverName = findTopPerformingDriver(fleetManagerId);

        // Generate monthly revenue map
        Map<String, Double> monthlyRevenue = generateMonthlyRevenue(fleetManagerId);

        // Get recent 5 trips
        List<Trip> recentTripsList = tripRepository.findTop5ByFleetManagerIdOrderByCreatedAtDesc(fleetManagerId);
        
        List<RecentTripDTO> recentTrips = recentTripsList.stream()
                .map(trip -> {
                    User driver = userRepository.findById(trip.getDriverId()).orElse(null);
                    String driverName = driver != null ? driver.getName() : "Unknown Driver";
                    return new RecentTripDTO(
                            trip.getId(),
                            driverName,
                            trip.getStatus(),
                            trip.getFare()
                    );
                })
                .collect(Collectors.toList());

        // Generate motivational message
        String motivationalMessage = getMotivationalMessage();

        return new FleetDashboardResponse(
                totalRevenue,
                activeTrips,
                totalVehicles,
                activeDrivers,
                averageTripRevenue,
                topDriverName,
                monthlyRevenue,
                recentTrips,
                motivationalMessage
        );
    }

    /**
     * Advanced Method 1: Calculate Average Trip Revenue using Stream API
     */
    private Double calculateAverageTripRevenue(Long fleetManagerId) {
        List<Trip> completedTrips = tripRepository.findByFleetManagerIdAndStatus(fleetManagerId, "COMPLETED");
        
        if (completedTrips.isEmpty()) {
            return 0.0;
        }

        // Using Stream API to calculate average
        return completedTrips.stream()
                .mapToDouble(Trip::getFare)
                .average()
                .orElse(0.0);
    }

    /**
     * Advanced Method 2: Find Top Performing Driver using Stream + Comparator
     */
    private String findTopPerformingDriver(Long fleetManagerId) {
        // Get all drivers under this fleet manager
        List<User> drivers = userRepository.findByRoleAndFleetManagerId("DRIVER", fleetManagerId);

        if (drivers.isEmpty()) {
            return "No Drivers";
        }

        // Find driver with maximum completed trips using Stream API
        Optional<User> topDriver = drivers.stream()
                .max(Comparator.comparingLong(driver -> 
                    tripRepository.countByDriverIdAndStatus(driver.getId(), "COMPLETED")
                ));

        return topDriver.map(User::getName).orElse("No Drivers");
    }

    /**
     * Advanced Method 3: Monthly Revenue Generator using HashMap and Stream
     */
    private Map<String, Double> generateMonthlyRevenue(Long fleetManagerId) {
        List<Trip> allTrips = tripRepository.findByFleetManagerId(fleetManagerId);

        // Using HashMap with getOrDefault pattern
        Map<String, Double> monthlyRevenueMap = new HashMap<>();

        allTrips.stream()
                .filter(trip -> "COMPLETED".equals(trip.getStatus()))
                .forEach(trip -> {
                    String month = trip.getCreatedAt().getMonth().name();
                    monthlyRevenueMap.put(
                        month, 
                        monthlyRevenueMap.getOrDefault(month, 0.0) + trip.getFare()
                    );
                });

        return monthlyRevenueMap;
    }

    /**
     * Advanced Method 4: Calculate Driver Performance Percentage
     */
    public double calculateDriverPerformance(Long driverId) {
        List<Trip> allTrips = tripRepository.findByDriverId(driverId);

        if (allTrips.isEmpty()) {
            return 0.0;
        }

        // Using Stream filtering
        long completedTrips = allTrips.stream()
                .filter(trip -> "COMPLETED".equals(trip.getStatus()))
                .count();

        long totalTrips = allTrips.size();

        return (completedTrips * 100.0) / totalTrips;
    }

    /**
     * Advanced Method 5: Motivational Message Generator using Random
     */
    private String getMotivationalMessage() {
        List<String> messages = Arrays.asList(
            "Drive Safe!",
            "Fleet Efficiency is Power!",
            "Customer Satisfaction First!",
            "Safety & Speed Together!",
            "Excellence in Every Mile!",
            "Your Fleet, Your Pride!",
            "Delivering Success Daily!",
            "Innovation Drives Us Forward!"
        );

        Random random = new Random();
        return messages.get(random.nextInt(messages.size()));
    }
}
