package com.sliit.userservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @Author User-Service
 * @Created on 03/05/2025
 * @Project API-Gateway-Testing
 * @Description: User Data DTO that contains user information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserData {
    private Long userId;
    private String userEmail;
    private String userName;
    private String role;
}

