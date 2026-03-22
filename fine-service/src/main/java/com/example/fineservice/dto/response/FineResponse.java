package com.example.fineservice.dto.response;

import com.example.fineservice.entity.FineStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FineResponse {

    private String fineId;
    private Long borrowId;
    private String studentId;
    private Integer daysLate;
    private BigDecimal amount;
    private FineStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
}
