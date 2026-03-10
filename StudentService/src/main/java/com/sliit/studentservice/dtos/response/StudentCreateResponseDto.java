package com.sliit.studentservice.dtos.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentCreateResponseDto {
    private boolean success;
    private String message;
    private String studentId;
    private String name;
    private String email;
}