package com.example.fineservice.dto.response;

import com.example.fineservice.entity.PaymentMethod;
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
public class FinePaymentResponse {

    private Long id;
    private String fineId;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private String referenceNote;
    private LocalDateTime paidAt;
}
