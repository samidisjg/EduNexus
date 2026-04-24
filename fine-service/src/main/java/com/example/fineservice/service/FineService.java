package com.example.fineservice.service;

import com.example.fineservice.dto.request.FineCalculationRequest;
import com.example.fineservice.dto.response.FineCalculationResponse;
import com.example.fineservice.dto.response.FineResponse;
import com.example.fineservice.entity.Fine;
import com.example.fineservice.entity.FineStatus;
import com.example.fineservice.exception.ResourceNotFoundException;
import com.example.fineservice.repository.FineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FineService {

    private final FineRepository fineRepository;

    @Value("${fine.amount.per-day}")
    private BigDecimal finePerDay;

    @Transactional
    public FineCalculationResponse calculateFine(FineCalculationRequest request) {
        log.info("Fine calculation request received. borrowId={}, studentId={}, daysLate={}",
                request.getBorrowId(), request.getStudentId(), request.getDaysLate());

        Fine existingFine = fineRepository.findByBorrowId(request.getBorrowId()).orElse(null);
        if (existingFine != null) {
            log.warn("Fine already exists for borrowId={}. Returning existing fineId={}",
                    request.getBorrowId(), existingFine.getFineId());
            return mapToCalculationResponse(existingFine);
        }

        BigDecimal amount = finePerDay.multiply(BigDecimal.valueOf(request.getDaysLate()));
        Fine fine = Fine.builder()
                .fineId(generateFineId())
                .borrowId(request.getBorrowId())
                .studentId(request.getStudentId().trim())
                .daysLate(request.getDaysLate())
                .amount(amount)
                .status(FineStatus.PENDING)
                .build();

        Fine savedFine = fineRepository.save(fine);
        log.info("Fine created successfully. fineId={}, borrowId={}, amount={}, status={}",
                savedFine.getFineId(), savedFine.getBorrowId(), savedFine.getAmount(), savedFine.getStatus());
        return mapToCalculationResponse(savedFine);
    }

    @Transactional(readOnly = true)
    public List<FineResponse> getAllFines() {
        log.info("Fetching all fines");
        List<FineResponse> fines = fineRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
        log.info("Fetched all fines successfully. count={}", fines.size());
        return fines;
    }

    @Transactional(readOnly = true)
    public FineResponse getFineByFineId(String fineId) {
        log.info("Fetching fine by fineId={}", fineId);
        FineResponse response = mapToResponse(getFineEntityByFineId(fineId));
        log.info("Fine fetched successfully. fineId={}, status={}", response.getFineId(), response.getStatus());
        return response;
    }

    @Transactional(readOnly = true)
    public List<FineResponse> getFinesByStudentId(String studentId) {
        String trimmedStudentId = studentId.trim();
        log.info("Fetching fines for studentId={}", trimmedStudentId);
        List<FineResponse> fines = fineRepository.findByStudentIdOrderByCreatedAtDesc(trimmedStudentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
        log.info("Fetched fines for studentId={}. count={}", trimmedStudentId, fines.size());
        return fines;
    }

    @Transactional(readOnly = true)
    public Fine getFineEntityByFineId(String fineId) {
        return fineRepository.findByFineId(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Demo update: fine record not found for ID " + fineId));
    }

    private FineCalculationResponse mapToCalculationResponse(Fine fine) {
        return FineCalculationResponse.builder()
                .fineId(fine.getFineId())
                .amount(fine.getAmount())
                .status(fine.getStatus())
                .build();
    }

    private FineResponse mapToResponse(Fine fine) {
        return FineResponse.builder()
                .fineId(fine.getFineId())
                .borrowId(fine.getBorrowId())
                .studentId(fine.getStudentId())
                .daysLate(fine.getDaysLate())
                .amount(fine.getAmount())
                .status(fine.getStatus())
                .createdAt(fine.getCreatedAt())
                .updatedAt(fine.getUpdatedAt())
                .paidAt(fine.getPaidAt())
                .build();
    }

    private String generateFineId() {
        return "FINE-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }
}
