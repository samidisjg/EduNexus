package com.example.fineservice.dto.request;

import com.example.fineservice.entity.FineStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
public class LibraryFineStatusUpdateRequest {

    @Size(max = 40, message = "Fine id must not exceed 40 characters")
    @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Fine id contains invalid characters")
    private String fineId;

    @NotNull(message = "Fine status is required")
    private FineStatus status;
}
