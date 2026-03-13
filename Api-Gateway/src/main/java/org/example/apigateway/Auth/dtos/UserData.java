package org.example.apigateway.Auth.dtos;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserData {
    private Long userId;
    private String role;
    private String userEmail;
    private String userName;

}
