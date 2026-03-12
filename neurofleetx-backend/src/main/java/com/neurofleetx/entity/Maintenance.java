package com.neurofleetx.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "maintenance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Maintenance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonIgnore
    private Vehicle vehicle;
    
    @Column(nullable = false)
    private String description;
    
    @Column(nullable = false)
    private Double cost;
    
    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;
    
    @Column(name = "next_service_date")
    private LocalDate nextServiceDate;
    
    @Column(nullable = false)
    private String status; // SCHEDULED, COMPLETED, IN_PROGRESS
}
