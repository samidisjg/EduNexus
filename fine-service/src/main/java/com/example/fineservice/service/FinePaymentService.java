package com.example.fineservice.service;

import com.example.fineservice.dto.request.FinePaymentRequest;
import com.example.fineservice.dto.request.LibraryFineStatusUpdateRequest;
import com.example.fineservice.dto.response.FinePaymentResponse;
import com.example.fineservice.entity.Fine;
import com.example.fineservice.entity.FinePayment;
import com.example.fineservice.entity.FineStatus;
import com.example.fineservice.exception.BadRequestException;
import com.example.fineservice.repository.FinePaymentRepository;
import com.example.fineservice.repository.FineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinePaymentService {

    private final FineService fineService;
    private final FineRepository fineRepository;
    private final FinePaymentRepository finePaymentRepository;
    private final LibraryClientService libraryClientService;

    @Transactional
    public FinePaymentResponse payFine(String fineId, FinePaymentRequest request) {
        log.info("Fine payment request received. fineId={}, paymentMethod={}, amount={}",
                fineId, request.getPaymentMethod(), request.getAmount());
        Fine fine = fineService.getFineEntityByFineId(fineId);

        if (FineStatus.PAID.equals(fine.getStatus())) {
            throw new BadRequestException("Fine has already been paid");
        }

        if (request.getAmount().compareTo(fine.getAmount()) != 0) {
            throw new BadRequestException("Payment amount must match the fine amount exactly");
        }

        LocalDateTime paymentTime = LocalDateTime.now();
        FinePayment payment = FinePayment.builder()
                .fine(fine)
                .paymentMethod(request.getPaymentMethod())
                .amount(request.getAmount())
                .referenceNote(request.getReferenceNote() != null ? request.getReferenceNote().trim() : null)
                .paidAt(paymentTime)
                .build();

        FinePayment savedPayment = finePaymentRepository.save(payment);

        fine.setStatus(FineStatus.PAID);
        fine.setPaidAt(paymentTime);
        fineRepository.save(fine);

        libraryClientService.updateBorrowFineStatus(
                fine.getBorrowId(),
                LibraryFineStatusUpdateRequest.builder()
                        .fineId(fine.getFineId())
                        .status(FineStatus.PAID)
                        .build()
        );

        log.info("Fine payment completed successfully. fineId={}, borrowId={}, paymentId={}",
                fineId, fine.getBorrowId(), savedPayment.getId());
        return mapToPaymentResponse(savedPayment);
    }

    @Transactional(readOnly = true)
    public List<FinePaymentResponse> getPaymentsByFineId(String fineId) {
        log.info("Fetching fine payments. fineId={}", fineId);
        fineService.getFineEntityByFineId(fineId);
        List<FinePaymentResponse> payments = finePaymentRepository.findByFineFineIdOrderByPaidAtDesc(fineId)
                .stream()
                .map(this::mapToPaymentResponse)
                .toList();
        log.info("Fine payments fetched successfully. fineId={}, count={}", fineId, payments.size());
        return payments;
    }

    private FinePaymentResponse mapToPaymentResponse(FinePayment payment) {
        return FinePaymentResponse.builder()
                .id(payment.getId())
                .fineId(payment.getFine().getFineId())
                .paymentMethod(payment.getPaymentMethod())
                .amount(payment.getAmount())
                .referenceNote(payment.getReferenceNote())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
