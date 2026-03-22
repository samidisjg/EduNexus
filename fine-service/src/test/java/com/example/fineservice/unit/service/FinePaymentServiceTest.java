package com.example.fineservice.unit.service;

import com.example.fineservice.dto.request.FinePaymentRequest;
import com.example.fineservice.dto.response.FinePaymentResponse;
import com.example.fineservice.entity.Fine;
import com.example.fineservice.entity.FinePayment;
import com.example.fineservice.entity.FineStatus;
import com.example.fineservice.entity.PaymentMethod;
import com.example.fineservice.exception.BadRequestException;
import com.example.fineservice.repository.FinePaymentRepository;
import com.example.fineservice.repository.FineRepository;
import com.example.fineservice.service.FinePaymentService;
import com.example.fineservice.service.FineService;
import com.example.fineservice.service.LibraryClientService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinePaymentServiceTest {

    @Mock
    private FineService fineService;

    @Mock
    private FineRepository fineRepository;

    @Mock
    private FinePaymentRepository finePaymentRepository;

    @Mock
    private LibraryClientService libraryClientService;

    @InjectMocks
    private FinePaymentService finePaymentService;

    @Test
    void payFineShouldPersistPaymentAndUpdateBorrowStatus() {
        Fine fine = Fine.builder()
                .fineId("FINE-PAID01")
                .borrowId(12L)
                .amount(new BigDecimal("400.00"))
                .status(FineStatus.PENDING)
                .build();

        when(fineService.getFineEntityByFineId("FINE-PAID01")).thenReturn(fine);
        when(finePaymentRepository.save(any(FinePayment.class))).thenAnswer(invocation -> {
            FinePayment payment = invocation.getArgument(0);
            payment.setId(90L);
            return payment;
        });
        when(fineRepository.save(any(Fine.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FinePaymentResponse response = finePaymentService.payFine("FINE-PAID01", FinePaymentRequest.builder()
                .paymentMethod(PaymentMethod.CARD)
                .amount(new BigDecimal("400.00"))
                .referenceNote(" paid in full ")
                .build());

        assertEquals(90L, response.getId());
        assertEquals("FINE-PAID01", response.getFineId());
        assertEquals(PaymentMethod.CARD, response.getPaymentMethod());
        assertEquals(FineStatus.PAID, fine.getStatus());
        assertNotNull(fine.getPaidAt());

        ArgumentCaptor<com.example.fineservice.dto.request.LibraryFineStatusUpdateRequest> requestCaptor =
                ArgumentCaptor.forClass(com.example.fineservice.dto.request.LibraryFineStatusUpdateRequest.class);
        verify(libraryClientService).updateBorrowFineStatus(eq(12L), requestCaptor.capture());
        assertEquals("FINE-PAID01", requestCaptor.getValue().getFineId());
        assertEquals(FineStatus.PAID, requestCaptor.getValue().getStatus());
    }

    @Test
    void payFineShouldRejectAmountMismatch() {
        Fine fine = Fine.builder()
                .fineId("FINE-ERR01")
                .borrowId(1L)
                .amount(new BigDecimal("200.00"))
                .status(FineStatus.PENDING)
                .build();

        when(fineService.getFineEntityByFineId("FINE-ERR01")).thenReturn(fine);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> finePaymentService.payFine("FINE-ERR01",
                FinePaymentRequest.builder()
                        .paymentMethod(PaymentMethod.CASH)
                        .amount(new BigDecimal("150.00"))
                        .build()));

        assertEquals("Payment amount must match the fine amount exactly", ex.getMessage());
        verify(finePaymentRepository, never()).save(any(FinePayment.class));
        verify(libraryClientService, never()).updateBorrowFineStatus(any(), any());
    }

    @Test
    void getPaymentsByFineIdShouldMapPaymentHistory() {
        Fine fine = Fine.builder()
                .fineId("FINE-HIST01")
                .borrowId(4L)
                .amount(new BigDecimal("100.00"))
                .status(FineStatus.PAID)
                .build();

        when(fineService.getFineEntityByFineId("FINE-HIST01")).thenReturn(fine);
        when(finePaymentRepository.findByFineFineIdOrderByPaidAtDesc("FINE-HIST01")).thenReturn(List.of(
                FinePayment.builder()
                        .id(5L)
                        .fine(fine)
                        .paymentMethod(PaymentMethod.ONLINE)
                        .amount(new BigDecimal("100.00"))
                        .referenceNote("receipt")
                        .paidAt(LocalDateTime.now())
                        .build()
        ));

        List<FinePaymentResponse> responses = finePaymentService.getPaymentsByFineId("FINE-HIST01");

        assertEquals(1, responses.size());
        assertEquals(5L, responses.get(0).getId());
        assertEquals(PaymentMethod.ONLINE, responses.get(0).getPaymentMethod());
    }
}
