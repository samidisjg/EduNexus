package com.example.fineservice.controller;

import com.example.fineservice.dto.request.FinePaymentRequest;
import com.example.fineservice.dto.response.FinePaymentResponse;
import com.example.fineservice.dto.response.FineResponse;
import com.example.fineservice.service.FinePaymentService;
import com.example.fineservice.service.FineService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/fines")
@RequiredArgsConstructor
@Slf4j
public class FineController {

    private final FineService fineService;
    private final FinePaymentService finePaymentService;

    @GetMapping
    public ResponseEntity<List<FineResponse>> getAllFines() {
        log.info("HIT - GET /fines | getAllFines");
        List<FineResponse> response = fineService.getAllFines();
        log.info("SUCCESS - GET /fines | getAllFines | count={}", response.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{fineId}")
    public ResponseEntity<FineResponse> getFineByFineId(
            @PathVariable
            @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Fine id contains invalid characters")
            String fineId
    ) {
        log.info("HIT - GET /fines/{} | getFineByFineId", fineId);
        FineResponse response = fineService.getFineByFineId(fineId);
        log.info("SUCCESS - GET /fines/{} | getFineByFineId | status={}", fineId, response.getStatus());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<FineResponse>> getFinesByStudentId(
            @PathVariable
            @Pattern(regexp = "^[A-Za-z0-9._/-]+$", message = "Student id contains invalid characters")
            String studentId
    ) {
        log.info("HIT - GET /fines/student/{} | getFinesByStudentId", studentId);
        List<FineResponse> response = fineService.getFinesByStudentId(studentId);
        log.info("SUCCESS - GET /fines/student/{} | getFinesByStudentId | count={}", studentId, response.size());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{fineId}/pay")
    public ResponseEntity<FinePaymentResponse> payFine(
            @PathVariable
            @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Fine id contains invalid characters")
            String fineId,
            @Valid @RequestBody FinePaymentRequest request
    ) {
        log.info("HIT - POST /fines/{}/pay | payFine", fineId);
        FinePaymentResponse response = finePaymentService.payFine(fineId, request);
        log.info("SUCCESS - POST /fines/{}/pay | payFine | paymentId={}", fineId, response.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{fineId}/payments")
    public ResponseEntity<List<FinePaymentResponse>> getPaymentsByFineId(
            @PathVariable
            @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Fine id contains invalid characters")
            String fineId
    ) {
        log.info("HIT - GET /fines/{}/payments | getPaymentsByFineId", fineId);
        List<FinePaymentResponse> response = finePaymentService.getPaymentsByFineId(fineId);
        log.info("SUCCESS - GET /fines/{}/payments | getPaymentsByFineId | count={}", fineId, response.size());
        return ResponseEntity.ok(response);
    }
}
