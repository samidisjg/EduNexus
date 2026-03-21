package com.example.courseservice.dto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AvailabilityResponse {
    private String courseId;
    private boolean available;
    private int remainingSeats;
}
