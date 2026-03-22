package com.example.courseservice.dto;

import com.example.courseservice.enums.CourseStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseStatsResponse {
    private String courseId;
    private int capacity;
    private int enrolled;
    private int remaining;
    private CourseStatus status;
}
