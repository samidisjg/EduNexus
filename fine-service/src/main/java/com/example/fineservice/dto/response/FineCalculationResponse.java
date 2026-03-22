package com.example.fineservice.dto.response;

import com.example.fineservice.entity.FineStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FineCalculationResponse {

    private String fineId;
    private BigDecimal amount;
    private FineStatus status;
}
