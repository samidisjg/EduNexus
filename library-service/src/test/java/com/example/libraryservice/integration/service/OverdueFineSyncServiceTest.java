package com.example.libraryservice.integration.service;

import com.example.libraryservice.dto.response.FineCalculationResponse;
import com.example.libraryservice.entity.BorrowRecord;
import com.example.libraryservice.entity.BorrowStatus;
import com.example.libraryservice.entity.FineStatus;
import com.example.libraryservice.repository.BorrowRecordRepository;
import com.example.libraryservice.service.FineClientService;
import com.example.libraryservice.service.OverdueFineSyncService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OverdueFineSyncServiceTest {

    @Mock
    private BorrowRecordRepository borrowRecordRepository;

    @Mock
    private FineClientService fineClientService;

    @InjectMocks
    private OverdueFineSyncService overdueFineSyncService;

    @Test
    void syncOverdueBorrowingsShouldCreateAndPersistFineDetails() {
        BorrowRecord overdueRecord = BorrowRecord.builder()
                .id(100L)
                .studentId("STU-900")
                .status(BorrowStatus.BORROWED)
                .dueDate(LocalDate.now().minusDays(2))
                .fineStatus(FineStatus.NONE)
                .build();

        when(borrowRecordRepository.findOverdueBorrowingsWithoutFine(eq(BorrowStatus.BORROWED), any(LocalDate.class), eq(FineStatus.NONE)))
                .thenReturn(List.of(overdueRecord));
        when(fineClientService.calculateFine(any())).thenReturn(FineCalculationResponse.builder()
                .fineId("FINE-90000001")
                .amount(new BigDecimal("200.00"))
                .status(FineStatus.PENDING)
                .build());

        overdueFineSyncService.syncOverdueBorrowingsToFineService();

        ArgumentCaptor<com.example.libraryservice.dto.request.FineCalculationRequest> requestCaptor =
                ArgumentCaptor.forClass(com.example.libraryservice.dto.request.FineCalculationRequest.class);
        verify(fineClientService).calculateFine(requestCaptor.capture());
        assertEquals(2L, requestCaptor.getValue().getDaysLate());
        assertEquals("FINE-90000001", overdueRecord.getFineId());
        assertEquals(FineStatus.PENDING, overdueRecord.getFineStatus());
        verify(borrowRecordRepository).save(overdueRecord);
    }

    @Test
    void syncOverdueBorrowingsShouldSkipSaveWhenNoRecordsNeedSync() {
        when(borrowRecordRepository.findOverdueBorrowingsWithoutFine(eq(BorrowStatus.BORROWED), any(LocalDate.class), eq(FineStatus.NONE)))
                .thenReturn(List.of());

        overdueFineSyncService.syncOverdueBorrowingsToFineService();

        verify(fineClientService, never()).calculateFine(any());
        verify(borrowRecordRepository, never()).save(any(BorrowRecord.class));
    }
}
