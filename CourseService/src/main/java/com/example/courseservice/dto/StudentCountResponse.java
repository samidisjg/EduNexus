package com.example.courseservice.dto;

import lombok.Data;

@Data
public class StudentCountResponse {

    private String courseId;

    private String enrolledCount;

}
