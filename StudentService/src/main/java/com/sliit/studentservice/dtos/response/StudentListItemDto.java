package com.sliit.studentservice.dtos.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StudentListItemDto {
    private String studentId;
    private String name;
    private String email;
    private String phone;
    private String department;
    private Integer year;
    private LocalDateTime createdAt;
}
