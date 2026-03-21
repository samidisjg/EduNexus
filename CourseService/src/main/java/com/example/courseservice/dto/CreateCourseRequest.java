package com.example.courseservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCourseRequest {
    @NotBlank
    private String courseId;

    @NotBlank
    private String name;

    @Min(0)
    private int capacity;
}
