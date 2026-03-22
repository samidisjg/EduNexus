package com.example.courseservice.dto;

import com.example.courseservice.enums.Faculty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCourseRequest {
    @NotBlank
    private String courseId;

    @NotBlank
    private String name;

    @Min(0)
    private int capacity;

    @NotNull
    private Faculty faculty;
}
