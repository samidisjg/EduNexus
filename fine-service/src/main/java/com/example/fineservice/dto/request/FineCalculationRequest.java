package com.example.fineservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
    @Positive(message = "Borrow id must be greater than 0")
    private Long borrowId;

    @NotBlank(message = "Student id is required")
    @Size(max = 30, message = "Student id must not exceed 30 characters")
    @Pattern(regexp = "^[A-Za-z0-9._/-]+$", message = "Student id contains invalid characters")
    private String studentId;

    @NotNull(message = "Days late is required")
    @Positive(message = "Days late must be greater than 0")
    private Integer daysLate;
}
