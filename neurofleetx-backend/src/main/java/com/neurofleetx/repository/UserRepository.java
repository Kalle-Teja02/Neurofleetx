package com.neurofleetx.repository;

import com.neurofleetx.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    long countByRoleAndFleetManagerId(String role, Long fleetManagerId);
    
    long countByRoleAndFleetManagerIdAndActiveTrue(String role, Long fleetManagerId);
    
    List<User> findByRoleAndFleetManagerId(String role, Long fleetManagerId);
    
    List<User> findByRole(String role);
}
