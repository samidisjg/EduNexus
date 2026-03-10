package com.sliit.studentservice.dtos.requests;

import lombok.Data;

@Data
public class StudentCreateRequestDto {

    private String studentId;

    private String name;

    private String email;

    private String phone;

    private String department;

    private Integer year;
}
