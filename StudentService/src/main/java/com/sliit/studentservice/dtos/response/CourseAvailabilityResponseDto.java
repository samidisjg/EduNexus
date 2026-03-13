package com.sliit.studentservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseAvailabilityResponseDto {
    private String courseId;
    private Boolean available;
    private Integer remainingSeats;
}
