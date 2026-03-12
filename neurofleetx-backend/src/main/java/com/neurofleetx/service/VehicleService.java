package com.neurofleetx.service;

import com.neurofleetx.entity.Vehicle;
import com.neurofleetx.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    public Vehicle addVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getAllVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        
        // Add default telemetry data if missing
        for (Vehicle vehicle : vehicles) {
            if (vehicle.getLatitude() == null || vehicle.getLatitude() == 0.0) {
                vehicle.setLatitude(17.385044 + (Math.random() * 0.1 - 0.05));
                vehicle.setLongitude(78.486671 + (Math.random() * 0.1 - 0.05));
                vehicle.setBatteryPercentage(60 + (int)(Math.random() * 40));
                vehicle.setFuelPercentage(40 + (int)(Math.random() * 60));
                vehicleRepository.save(vehicle);
            }
        }
        
        return vehicles;
    }

    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        
        vehicle.setVehicleNumber(vehicleDetails.getVehicleNumber());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setStatus(vehicleDetails.getStatus());
        vehicle.setLatitude(vehicleDetails.getLatitude());
        vehicle.setLongitude(vehicleDetails.getLongitude());
        vehicle.setBatteryPercentage(vehicleDetails.getBatteryPercentage());
        vehicle.setFuelPercentage(vehicleDetails.getFuelPercentage());
        
        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        
        // Clear maintenance records first (cascade should handle this, but being explicit)
        if (vehicle.getMaintenanceRecords() != null) {
            vehicle.getMaintenanceRecords().clear();
        }
        
        vehicleRepository.delete(vehicle);
        System.out.println("✅ Vehicle deleted successfully: " + id);
    }
}
