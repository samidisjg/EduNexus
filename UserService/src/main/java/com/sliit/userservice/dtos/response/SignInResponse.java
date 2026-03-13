package com.sliit.userservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @Author User-Service
 * @Created on 03/05/2025
 * @Project API-Gateway-Testing
 * @Description: Sign In Response DTO with access token
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignInResponse {
    private Long userId;
    private String userName;
    private String userEmail;
    private String role;
    private String accessToken;
    private String refreshToken;
}

