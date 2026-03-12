package com.neurofleetx.repository;

import com.neurofleetx.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    
    long countByFleetManagerIdAndStatus(Long fleetManagerId, String status);
    
    List<Trip> findTop5ByFleetManagerIdOrderByCreatedAtDesc(Long fleetManagerId);
    
    List<Trip> findByFleetManagerId(Long fleetManagerId);
    
    List<Trip> findByDriverId(Long driverId);
    
    long countByDriverIdAndStatus(Long driverId, String status);
    
    @Query("SELECT SUM(t.fare) FROM Trip t WHERE t.fleetManagerId = :fleetManagerId AND t.status = 'COMPLETED'")
    Double sumFareByFleetManagerIdAndStatusCompleted(@Param("fleetManagerId") Long fleetManagerId);
    
    List<Trip> findByFleetManagerIdAndStatus(Long fleetManagerId, String status);
    
    List<Trip> findByDriverIdAndStatus(Long driverId, String status);
    
    List<Trip> findByVehicleIdAndStatus(Long vehicleId, String status);
    
    List<Trip> findByStatus(String status);
}
