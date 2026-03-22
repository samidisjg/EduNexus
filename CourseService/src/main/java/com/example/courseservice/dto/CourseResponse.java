package com.example.courseservice.dto;

import com.example.courseservice.enums.CourseStatus;
import com.example.courseservice.enums.Faculty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseResponse {
    private String courseId;
    private String name;
    private int capacity;
    private int year;
    private int semester;
    private String lic;
    private Faculty faculty;
    private CourseStatus status;
}
