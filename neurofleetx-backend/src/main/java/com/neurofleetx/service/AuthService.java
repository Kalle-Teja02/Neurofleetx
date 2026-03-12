package com.neurofleetx.service;

import com.neurofleetx.dto.AuthResponse;
import com.neurofleetx.dto.LoginRequest;
import com.neurofleetx.dto.RegisterRequest;
import com.neurofleetx.entity.User;
import com.neurofleetx.repository.UserRepository;
import com.neurofleetx.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setGender(request.getGender());
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setCity(request.getCity());
        user.setAadhar(request.getAadhar());
        user.setLicense(request.getLicense());
        user.setCompany(request.getCompany());
        user.setAdminRegNo(request.getAdminRegNo());
        user.setActive(true);

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole(), user.getId());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole(), user.getId());
    }
}
