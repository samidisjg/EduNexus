package com.sliit.userservice.dtos.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @Author User-Service
 * @Created on 03/05/2025
 * @Project API-Gateway-Testing
 * @Description: Sign In Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignInRequest {
    private String userEmail;
    private String userPassword;
}

