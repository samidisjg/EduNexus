package com.example.courseservice.dto;

import com.example.courseservice.enums.CourseStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseResponse {
    private String courseId;
    private String name;
    private int capacity;
    private CourseStatus status;
}
