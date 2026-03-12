package com.neurofleetx.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    private String gender;
    
    @Column(nullable = false)
    private String role; // Back to String
    
    private String phone;
    private String city;
    private String aadhar;
    private String license;
    private String company;
    private String adminRegNo;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    private Long fleetManagerId; // For DRIVER role only
    private Long vehicleId; // For DRIVER role - assigned vehicle
}
