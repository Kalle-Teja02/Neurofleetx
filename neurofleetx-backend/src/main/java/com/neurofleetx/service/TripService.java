package com.neurofleetx.service;

import com.neurofleetx.entity.Trip;
import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.repository.TripRepository;
import com.neurofleetx.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public Trip startTrip(Long driverId, Long vehicleId) {
        // Validation: Check if driver already has active trip
        List<Trip> activeDriverTrips = tripRepository.findByDriverIdAndStatus(driverId, "ACTIVE");
        if (!activeDriverTrips.isEmpty()) {
            throw new RuntimeException("Driver already has an active trip");
        }

        // Validation: Check if vehicle already has active trip
        List<Trip> activeVehicleTrips = tripRepository.findByVehicleIdAndStatus(vehicleId, "ACTIVE");
        if (!activeVehicleTrips.isEmpty()) {
            throw new RuntimeException("Vehicle is already in use");
        }

        // Validation: Check if vehicle is in maintenance
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        
        if ("MAINTENANCE".equals(vehicle.getStatus())) {
            throw new RuntimeException("Vehicle is under maintenance");
        }

        // Create new trip
        Trip trip = new Trip();
        trip.setDriverId(driverId);
        trip.setVehicleId(vehicleId);
        trip.setFleetManagerId(vehicle.getFleetManagerId());
        trip.setStartTime(LocalDateTime.now());
        trip.setCreatedAt(LocalDateTime.now());
        trip.setStatus("ACTIVE");
        trip.setFare(0.0);
        
        // Update vehicle status to IN_USE
        vehicle.setStatus("IN_USE");
        vehicle.setAssignedDriverId(driverId);
        vehicleRepository.save(vehicle);
        
        return tripRepository.save(trip);
    }
    
    public Trip endTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!"ACTIVE".equals(trip.getStatus())) {
            throw new RuntimeException("Trip is not active");
        }
        
        trip.setEndTime(LocalDateTime.now());
        trip.setStatus("COMPLETED");
        
        // Update vehicle status back to AVAILABLE
        if (trip.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(trip.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            vehicle.setStatus("AVAILABLE");
            vehicle.setAssignedDriverId(null);
            vehicleRepository.save(vehicle);
        }
        
        return tripRepository.save(trip);
    }
    
    public Trip getActiveTrip(Long driverId) {
        List<Trip> activeTrips = tripRepository.findByDriverIdAndStatus(driverId, "ACTIVE");
        return activeTrips.isEmpty() ? null : activeTrips.get(0);
    }
    
    public List<Trip> getTripsByDriver(Long driverId) {
        return tripRepository.findByDriverId(driverId);
    }
    
    public List<Trip> getActiveTrips() {
        return tripRepository.findByStatus("ACTIVE");
    }
}
