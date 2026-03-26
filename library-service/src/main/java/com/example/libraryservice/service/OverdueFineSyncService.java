package com.example.libraryservice.service;

import com.example.libraryservice.dto.request.FineCalculationRequest;
import com.example.libraryservice.dto.response.FineCalculationResponse;
import com.example.libraryservice.entity.BorrowRecord;
import com.example.libraryservice.entity.BorrowStatus;
import com.example.libraryservice.entity.FineStatus;
import com.example.libraryservice.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OverdueFineSyncService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final FineClientService fineClientService;

    @Scheduled(
            initialDelayString = "${fine.overdue-sync.initial-delay-ms:15000}",
            fixedDelayString = "${fine.overdue-sync.fixed-delay-ms:60000}"
    )
    @Transactional
    public void syncOverdueBorrowingsToFineService() {
        LocalDate today = LocalDate.now();
        List<BorrowRecord> overdueBorrowings = borrowRecordRepository.findOverdueBorrowingsWithoutFine(
                BorrowStatus.BORROWED,
                today,
                FineStatus.NONE
        );

        if (overdueBorrowings.isEmpty()) {
            log.debug("No overdue borrowings pending fine sync for {}", today);
            return;
        }

        log.info("Syncing overdue borrowings to Fine Service. count={}, date={}", overdueBorrowings.size(), today);

        for (BorrowRecord borrowRecord : overdueBorrowings) {
            long daysLate = ChronoUnit.DAYS.between(borrowRecord.getDueDate(), today);
            if (daysLate <= 0) {
                log.debug("Skipping borrow record that is not yet overdue. borrowId={}, dueDate={}, today={}",
                        borrowRecord.getId(), borrowRecord.getDueDate(), today);
                continue;
            }

            try {
                FineCalculationResponse fineResponse = fineClientService.calculateFine(
                        FineCalculationRequest.builder()
                                .borrowId(borrowRecord.getId())
                                .studentId(borrowRecord.getStudentId())
                                .daysLate(daysLate)
                                .build()
                );

                borrowRecord.setFineId(fineResponse.getFineId());
                borrowRecord.setFineAmount(fineResponse.getAmount());
                borrowRecord.setFineStatus(fineResponse.getStatus() != null ? fineResponse.getStatus() : FineStatus.PENDING);
                borrowRecordRepository.save(borrowRecord);

                log.info("Overdue borrowing synced successfully. borrowId={}, fineId={}, daysLate={}, chargeableDays={}",
                        borrowRecord.getId(), borrowRecord.getFineId(), daysLate, daysLate);
            } catch (Exception ex) {
                log.error("Failed to sync overdue borrowing to Fine Service. borrowId={}", borrowRecord.getId(), ex);
            }
        }
    }
}
