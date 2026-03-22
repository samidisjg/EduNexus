package com.example.courseservice.dto;

import com.example.courseservice.enums.Faculty;
import jakarta.validation.constraints.Max;
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

    @Min(1)
    private int year;

    @Min(1)
    @Max(2)
    private int semester;

    @NotBlank
    private String lic;

    @NotNull
    private Faculty faculty;
}
