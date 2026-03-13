package com.sliit.userservice.controller;

import com.sliit.userservice.dtos.UserResponse;
import com.sliit.userservice.dtos.requests.SignInRequest;
import com.sliit.userservice.dtos.requests.SignUpRequest;
import com.sliit.userservice.dtos.response.SignInResponse;
import com.sliit.userservice.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * @Author User-Service
 * @Created on 03/05/2025
 * @Project API-Gateway-Testing
 * @Description: Authentication Controller for Sign Up, Sign In, and Token Validation
 */
@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Sign up new user
     * POST /user-service/auth/sign-up
     */
    @PostMapping("/sign-up")
    public ResponseEntity<Map<String, Object>> signUp(@RequestBody SignUpRequest request) {
        log.info("Sign up endpoint called for user: {}", request.getUserEmail());

        UserResponse response = authService.signUp(request);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("message", response.getMessage());
        responseBody.put("statusCode", response.getStatusCode());
        responseBody.put("body", response.getData());

        return ResponseEntity.status(HttpStatus.CREATED).body(responseBody);
    }

    /**
     * Sign in user
     * POST /user-service/auth/sign-in
     */
    @PostMapping("/sign-in")
    public ResponseEntity<Map<String, Object>> signIn(@RequestBody SignInRequest request) {
        log.info("Sign in endpoint called for user: {}", request.getUserEmail());

        SignInResponse response = authService.signIn(request);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("message", "User signed in successfully");
        responseBody.put("statusCode", 200);
        responseBody.put("body", response);

        return ResponseEntity.ok(responseBody);
    }

    /**
     * Validate token
     * POST /user-service/auth/validate-token
     */
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(
            @RequestHeader("Authorization") String authorizationHeader) {
        log.info("Token validation endpoint called");

        UserResponse response = authService.validateToken(authorizationHeader);

//        Map<String, Object> responseBody = new HashMap<>();
//        responseBody.put("message", response.getMessage());
//        responseBody.put("statusCode", response.getStatusCode());
//        responseBody.put("body", response.getData());

        return ResponseEntity.ok(response);
    }

    /**
     * Get user by ID (for internal service-to-service communication)
     * GET /user-service/auth/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long userId) {
        log.info("Get user by ID endpoint called for userId: {}", userId);

        UserResponse response = authService.getUserById(userId);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("message", response.getMessage());
        responseBody.put("statusCode", response.getStatusCode());
        responseBody.put("body", response.getData());

        return ResponseEntity.ok(responseBody);
    }

    /**
     * Health check endpoint
     * GET /user-service/auth/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        log.info("Health check endpoint called");

        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "User Service");
        response.put("message", "Service is running");

        return ResponseEntity.ok(response);
    }
}

