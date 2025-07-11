package com.backend.backendjar.service;

import com.backend.backendjar.dto.AuthResponse;
import com.backend.backendjar.dto.LoginRequest;
import com.backend.backendjar.dto.RegisterRequest;
import com.backend.backendjar.entity.Role;
import com.backend.backendjar.entity.User;
import com.backend.backendjar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // Check if user is already authenticated (manager/admin creating new user)
        boolean isAuthenticated = SecurityContextHolder.getContext().getAuthentication() != null && 
                                 SecurityContextHolder.getContext().getAuthentication().isAuthenticated() &&
                                 !SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser");
        
        // If not authenticated, restrict to WAITER role only
        if (!isAuthenticated && request.getRole() != Role.WAITER) {
            throw new RuntimeException("Public registration is only allowed for waiter");
        }
        
        // Check if username already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);
        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token, user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException ex) {
            throw new RuntimeException("Invalid username or password");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token, user.getRole().name());
    }
}
