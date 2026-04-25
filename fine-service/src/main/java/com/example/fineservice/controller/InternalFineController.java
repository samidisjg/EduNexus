package com.example.fineservice.controller;

import com.example.fineservice.dto.request.FineCalculationRequest;
import com.example.fineservice.dto.response.FineCalculationResponse;
import com.example.fineservice.service.FineService;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//demo test 1
@Hidden
@RestController
@RequestMapping("/internal/fines")
@RequiredArgsConstructor
@Slf4j
public class InternalFineController {

    private final FineService fineService;

    @PostMapping("/calculate")
    public ResponseEntity<FineCalculationResponse> calculateFine(
            @Valid @RequestBody FineCalculationRequest request
    ) {
        log.info("HIT - POST /internal/fines/calculate | calculateFine | borrowId={}, studentId={}, daysLate={}",
                request.getBorrowId(), request.getStudentId(), request.getDaysLate());
        FineCalculationResponse response = fineService.calculateFine(request);
        log.info("SUCCESS - POST /internal/fines/calculate | calculateFine | fineId={}, amount={}, status={}",
                response.getFineId(), response.getAmount(), response.getStatus());
        return ResponseEntity.ok(response);
    }
}
