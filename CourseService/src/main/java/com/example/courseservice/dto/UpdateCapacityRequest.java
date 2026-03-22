package com.example.courseservice.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateCapacityRequest {
    @Min(0)
    private int capacity;
}
