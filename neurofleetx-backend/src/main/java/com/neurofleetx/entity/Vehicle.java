package com.neurofleetx.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String vehicleNumber;
    
    private String model;
    
    @Column(nullable = false)
    private String status; // AVAILABLE, IN_USE, MAINTENANCE
    
    @Column(nullable = false)
    private Long fleetManagerId;
    
    // Driver assignment
    private Long assignedDriverId;
    
    // Telemetry fields
    private Double latitude;
    
    private Double longitude;
    
    private Integer batteryPercentage;
    
    private Integer fuelPercentage;
    
    private Double speed; // in km/h
    
    private LocalDateTime lastUpdatedTime;
    
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Maintenance> maintenanceRecords = new ArrayList<>();
    
    // Smart status logic
    @PreUpdate
    @PrePersist
    public void updateStatus() {
        // Auto-set to MAINTENANCE if battery or fuel is low
        if ((batteryPercentage != null && batteryPercentage < 20) || 
            (fuelPercentage != null && fuelPercentage < 15)) {
            this.status = "MAINTENANCE";
        }
        
        // Update last updated time
        this.lastUpdatedTime = LocalDateTime.now();
    }
}
