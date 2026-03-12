package com.neurofleetx.repository;

import com.neurofleetx.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    long countByFleetManagerId(Long fleetManagerId);
    
    long countByFleetManagerIdAndStatus(Long fleetManagerId, String status);
    
    List<Vehicle> findByFleetManagerId(Long fleetManagerId);
    
    List<Vehicle> findByStatus(String status);
    
    List<Vehicle> findByBatteryPercentageLessThan(Integer threshold);
    
    List<Vehicle> findByFuelPercentageLessThan(Integer threshold);
    
    List<Vehicle> findByFleetManagerIdAndStatus(Long fleetManagerId, String status);
    
    List<Vehicle> findByFleetManagerIdAndBatteryPercentageLessThan(Long fleetManagerId, Integer threshold);
}
