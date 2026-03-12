package com.neurofleetx.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            final String authorizationHeader = request.getHeader("Authorization");
            
            System.out.println("🔍 JWT Filter - Request URI: " + request.getRequestURI());
            System.out.println("🔍 JWT Filter - Authorization Header: " + (authorizationHeader != null ? "Present" : "Missing"));

            String email = null;
            String jwt = null;

            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                jwt = authorizationHeader.substring(7);
                System.out.println("🔍 JWT Filter - Token length: " + jwt.length());
                try {
                    email = jwtUtil.extractEmail(jwt);
                    System.out.println("✅ JWT Filter - Email extracted: " + email);
                } catch (Exception e) {
                    System.out.println("❌ JWT Filter - Token extraction failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
                }
            } else {
                System.out.println("⚠️  JWT Filter - No Bearer token in header");
            }

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);
                    System.out.println("✅ JWT Filter - User loaded: " + email);

                    if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                        UsernamePasswordAuthenticationToken authenticationToken = 
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                        System.out.println("✅ JWT Filter - Authentication set successfully");
                    } else {
                        System.out.println("❌ JWT Filter - Token validation failed");
                    }
                } catch (Exception e) {
                    System.out.println("❌ JWT Filter - Error loading user: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.out.println("❌ JWT Filter - Unexpected error: " + e.getMessage());
            e.printStackTrace();
        }
        
        filterChain.doFilter(request, response);
    }
}
