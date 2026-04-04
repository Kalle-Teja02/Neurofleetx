package com.neurofleetx.config;

import com.neurofleetx.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/analytics").permitAll()
                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers("/api/diagnostic/**").permitAll()
                .requestMatchers("/api/fleet/dashboard/test").permitAll()
                .requestMatchers("/api/vehicles/manager/test").permitAll()
                .requestMatchers("/api/vehicles/test").permitAll()
                .requestMatchers("/api/vehicles/test/**").permitAll()
                .requestMatchers("/api/vehicles/add-telemetry").permitAll()
                .requestMatchers("/api/vehicles/*/service-complete").permitAll()
                .requestMatchers("/api/vehicles/status/**").permitAll()
                .requestMatchers("/api/vehicles/low-battery").permitAll()
                .requestMatchers("/api/vehicles/maintenance").permitAll()
                .requestMatchers("/api/vehicles/*/telemetry").permitAll()
                .requestMatchers("/api/drivers/manager/test").permitAll()
                .requestMatchers("/api/drivers/manager/test/**").permitAll()
                .requestMatchers("/api/trips/manager/test").permitAll()
                .requestMatchers("/api/trips/test/**").permitAll()
                .requestMatchers("/api/reports/manager/test").permitAll()
                .requestMatchers("/api/maintenance/manager/test").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); // Allow all origins for testing
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}