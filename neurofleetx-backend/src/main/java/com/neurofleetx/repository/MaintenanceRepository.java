package com.neurofleetx.repository;

import com.neurofleetx.entity.Maintenance;
import com.neurofleetx.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    
    List<Maintenance> findByVehicle(Vehicle vehicle);
    
    List<Maintenance> findByVehicleIn(List<Vehicle> vehicles);
    
    @Query("SELECT m FROM Maintenance m WHERE m.vehicle.fleetManagerId = :fleetManagerId")
    List<Maintenance> findByFleetManagerId(@Param("fleetManagerId") Long fleetManagerId);
    
    @Query("SELECT m FROM Maintenance m WHERE m.vehicle.id = :vehicleId")
    List<Maintenance> findByVehicleId(@Param("vehicleId") Long vehicleId);
}
