package com.neurofleetx.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trip {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String status; // ACTIVE, COMPLETED, CANCELLED
    
    @Column(nullable = false)
    private Double fare; // Also called revenue
    
    @Column(nullable = false)
    private Long driverId;
    
    private Long vehicleId;
    
    @Column(nullable = false)
    private Long fleetManagerId;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;

    private Double pickupLat;
    private Double pickupLng;
    private Double dropLat;
    private Double dropLng;
    
    // Optional: Add JPA relationships if needed
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "driverId", insertable = false, updatable = false)
    // private User driver;
    
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "vehicleId", insertable = false, updatable = false)
    // private Vehicle vehicle;
}
