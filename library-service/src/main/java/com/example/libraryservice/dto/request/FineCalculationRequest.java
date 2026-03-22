package com.example.libraryservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FineCalculationRequest {

    @NotNull(message = "Borrow id is required")
    private Long borrowId;

    @NotBlank(message = "Student id is required")
    @Size(max = 30, message = "Student id must not exceed 30 characters")
    private String studentId;

    @NotNull(message = "Days late is required")
    @Positive(message = "Days late must be greater than 0")
    private Long daysLate;
}
