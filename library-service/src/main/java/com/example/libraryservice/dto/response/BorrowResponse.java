package com.example.libraryservice.dto.response;

import com.example.libraryservice.entity.BorrowStatus;
import com.example.libraryservice.entity.FineStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowResponse {

    private Long id;
    private Long bookId;
    private String studentId;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnedDate;
    private BorrowStatus status;
    private String fineId;
    private BigDecimal fineAmount;
    private FineStatus fineStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
