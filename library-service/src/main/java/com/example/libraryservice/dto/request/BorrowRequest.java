package com.example.libraryservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowRequest {

    @NotNull(message = "Book id is required")
    private Long bookId;

    @NotBlank(message = "Student id is required")
    @Size(max = 30, message = "Student id must not exceed 30 characters")
    @Pattern(regexp = "^[A-Za-z0-9._/-]+$", message = "Student id contains invalid characters")
    private String studentId;

    private LocalDate borrowDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
}
