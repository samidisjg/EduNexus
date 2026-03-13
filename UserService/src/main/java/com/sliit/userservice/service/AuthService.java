package com.sliit.userservice.service;

import com.sliit.userservice.dtos.UserData;
import com.sliit.userservice.dtos.UserResponse;
import com.sliit.userservice.dtos.requests.SignInRequest;
import com.sliit.userservice.dtos.requests.SignUpRequest;
import com.sliit.userservice.dtos.response.SignInResponse;
import com.sliit.userservice.entity.UserEntity;
import com.sliit.userservice.exception.InvalidCredentialsException;
import com.sliit.userservice.exception.UserAlreadyExistsException;
import com.sliit.userservice.exception.UserNotFoundException;
import com.sliit.userservice.repository.UserRepository;
import com.sliit.userservice.util.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * @Author User-Service
 * @Created on 03/05/2025
 * @Project API-Gateway-Testing
 * @Description: Authentication Service for Sign Up, Sign In, and Token Validation
 */
@Slf4j
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Sign up new user
     */
    public UserResponse signUp(SignUpRequest request) {
        log.info("Sign up request for user: {}", request.getUserEmail());

        // Check if user already exists by email
        Optional<UserEntity> existingUserByEmail = userRepository.findByUserEmail(request.getUserEmail());
        if (existingUserByEmail.isPresent()) {
            log.warn("User already exists with email: {}", request.getUserEmail());
            throw new UserAlreadyExistsException("User already exists with this email");
        }

        // Check if username already exists
        Optional<UserEntity> existingUserByName = userRepository.findByUserName(request.getUserName());
        if (existingUserByName.isPresent()) {
            log.warn("Username already exists: {}", request.getUserName());
            throw new UserAlreadyExistsException("Username already exists");
        }

        // Create new user
        UserEntity newUser = UserEntity.builder()
                .userName(request.getUserName())
                .userEmail(request.getUserEmail())
                .userPassword(passwordEncoder.encode(request.getUserPassword()))
                .role(request.getRole() != null ? request.getRole() : "USER")
                .isActive(true)
                .build();

        UserEntity savedUser = userRepository.save(newUser);
        log.info("User registered successfully with email: {}", savedUser.getUserEmail());

        // Build response
        UserData userData = UserData.builder()
                .userId(savedUser.getUserId())
                .userEmail(savedUser.getUserEmail())
                .userName(savedUser.getUserName())
                .role(savedUser.getRole())
                .build();

        return UserResponse.builder()
                .message("User registered successfully")
                .statusCode(201)
                .data(userData)
                .build();
    }

    /**
     * Sign in user and return access token
     */
    public SignInResponse signIn(SignInRequest request) {
        log.info("Sign in request for user: {}", request.getUserEmail());

        // Find user by email
        UserEntity user = userRepository.findByUserEmail(request.getUserEmail())
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", request.getUserEmail());
                    return new UserNotFoundException("User not found with this email");
                });

        // Verify password
        if (!passwordEncoder.matches(request.getUserPassword(), user.getUserPassword())) {
            log.warn("Invalid password for user: {}", request.getUserEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Check if user is active
        if (!user.getIsActive()) {
            log.warn("User account is inactive: {}", request.getUserEmail());
            throw new UserNotFoundException("User account is inactive");
        }

        // Generate tokens
        String accessToken = jwtTokenProvider.generateToken(
                user.getUserId(),
                user.getUserEmail(),
                user.getUserName(),
                user.getRole()
        );

        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());

        log.info("User signed in successfully: {}", request.getUserEmail());

        // Build response
        return SignInResponse.builder()
                .userId(user.getUserId())
                .userName(user.getUserName())
                .userEmail(user.getUserEmail())
                .role(user.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * Validate access token and return user information
     */
    public UserResponse validateToken(String token) {
        log.info("Validating token");

        // Remove "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // Validate token
        if (!jwtTokenProvider.validateToken(token)) {
            log.warn("Invalid or expired token");
            throw new InvalidCredentialsException("Invalid or expired token");
        }

        // Extract user information from token
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        String userEmail = jwtTokenProvider.getUserEmailFromToken(token);
        String userName = jwtTokenProvider.getUserNameFromToken(token);
        String role = jwtTokenProvider.getRoleFromToken(token);

        log.info("Token validated successfully for user: {}", userEmail);

        // Build response
        UserData userData = UserData.builder()
                .userId(userId)
                .userEmail(userEmail)
                .userName(userName)
                .role(role)
                .build();

        return UserResponse.builder()
                .message("Token is valid")
                .statusCode(200)
                .data(userData)
                .build();
    }

    /**
     * Get user by ID (for internal service-to-service communication)
     */
    public UserResponse getUserById(Long userId) {
        log.info("Getting user by ID: {}", userId);

        UserEntity user = userRepository.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with this ID");
                });

        UserData userData = UserData.builder()
                .userId(user.getUserId())
                .userEmail(user.getUserEmail())
                .userName(user.getUserName())
                .role(user.getRole())
                .build();

        return UserResponse.builder()
                .message("User found")
                .statusCode(200)
                .data(userData)
                .build();
    }
}

