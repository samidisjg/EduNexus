package com.example.fineservice.unit.service;

import com.example.fineservice.dto.request.FineCalculationRequest;
import com.example.fineservice.dto.response.FineCalculationResponse;
import com.example.fineservice.dto.response.FineResponse;
import com.example.fineservice.entity.Fine;
import com.example.fineservice.entity.FineStatus;
import com.example.fineservice.exception.ResourceNotFoundException;
import com.example.fineservice.repository.FineRepository;
import com.example.fineservice.service.FineService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FineServiceTest {

    @Mock
    private FineRepository fineRepository;

    @InjectMocks
    private FineService fineService;

    @Test
    void calculateFineShouldCreatePendingFineWithTrimmedStudentId() {
        ReflectionTestUtils.setField(fineService, "finePerDay", new BigDecimal("100.00"));
        FineCalculationRequest request = FineCalculationRequest.builder()
                .borrowId(10L)
                .studentId(" STU-100 ")
                .daysLate(3)
                .build();

        when(fineRepository.findByBorrowId(10L)).thenReturn(Optional.empty());
        when(fineRepository.save(any(Fine.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FineCalculationResponse response = fineService.calculateFine(request);

        assertNotNull(response.getFineId());
        assertEquals(new BigDecimal("300.00"), response.getAmount());
        assertEquals(FineStatus.PENDING, response.getStatus());
    }

    @Test
    void calculateFineShouldReturnExistingFineWhenBorrowAlreadyHasOne() {
        ReflectionTestUtils.setField(fineService, "finePerDay", new BigDecimal("100.00"));
        Fine existingFine = Fine.builder()
                .fineId("FINE-EXISTS1")
                .borrowId(10L)
                .studentId("STU-100")
                .daysLate(5)
                .amount(new BigDecimal("500.00"))
                .status(FineStatus.PENDING)
                .build();

        when(fineRepository.findByBorrowId(10L)).thenReturn(Optional.of(existingFine));

        FineCalculationResponse response = fineService.calculateFine(FineCalculationRequest.builder()
                .borrowId(10L)
                .studentId("STU-100")
                .daysLate(5)
                .build());

        assertEquals("FINE-EXISTS1", response.getFineId());
        assertEquals(new BigDecimal("500.00"), response.getAmount());
        verify(fineRepository, never()).save(any(Fine.class));
    }

    @Test
    void getFinesByStudentIdShouldTrimInputAndMapResponses() {
        Fine fine = Fine.builder()
                .fineId("FINE-TRIM01")
                .borrowId(7L)
                .studentId("STU-77")
                .daysLate(2)
                .amount(new BigDecimal("200.00"))
                .status(FineStatus.PENDING)
                .build();

        when(fineRepository.findByStudentIdOrderByCreatedAtDesc("STU-77")).thenReturn(List.of(fine));

        List<FineResponse> responses = fineService.getFinesByStudentId(" STU-77 ");

        assertEquals(1, responses.size());
        assertEquals("FINE-TRIM01", responses.get(0).getFineId());
    }

    @Test
    void getFineEntityByFineIdShouldThrowWhenMissing() {
        when(fineRepository.findByFineId("FINE-MISSING")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> fineService.getFineEntityByFineId("FINE-MISSING"));
    }
}
