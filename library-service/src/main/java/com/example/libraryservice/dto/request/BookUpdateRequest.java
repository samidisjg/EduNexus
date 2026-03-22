package com.example.libraryservice.dto.request;

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
public class BookUpdateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    @Pattern(regexp = "^[^<>\\p{Cntrl}]*$", message = "Title contains invalid characters")
    private String title;

    @NotBlank(message = "Author is required")
    @Size(max = 120, message = "Author must not exceed 120 characters")
    @Pattern(regexp = "^[^<>\\p{Cntrl}]*$", message = "Author contains invalid characters")
    private String author;

    @NotBlank(message = "ISBN is required")
    @Size(max = 50, message = "ISBN must not exceed 50 characters")
    @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "ISBN contains invalid characters")
    private String isbn;

    @NotNull(message = "Total copies is required")
    @Positive(message = "Total copies must be greater than 0")
    private Integer totalCopies;
}
