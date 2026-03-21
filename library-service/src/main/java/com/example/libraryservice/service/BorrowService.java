package com.example.libraryservice.service;

import com.example.libraryservice.dto.request.BorrowRequest;
import com.example.libraryservice.dto.request.FineCalculationRequest;
import com.example.libraryservice.dto.request.FineStatusUpdateRequest;
import com.example.libraryservice.dto.response.BorrowResponse;
import com.example.libraryservice.dto.response.FineCalculationResponse;
import com.example.libraryservice.entity.Book;
import com.example.libraryservice.entity.BorrowRecord;
import com.example.libraryservice.entity.BorrowStatus;
import com.example.libraryservice.entity.FineStatus;
import com.example.libraryservice.exception.BadRequestException;
import com.example.libraryservice.exception.ResourceNotFoundException;
import com.example.libraryservice.repository.BookRepository;
import com.example.libraryservice.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final BookService bookService;
    private final FineClientService fineClientService;

    @Transactional
    public BorrowResponse borrowBook(BorrowRequest request) {
        log.info("Borrow request received. bookId={}, studentId={}, borrowDate={}, dueDate={}",
                request.getBookId(), request.getStudentId(), request.getBorrowDate(), request.getDueDate());
        Book book = bookService.getBookEntityById(request.getBookId());

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("No available copies for book id: " + request.getBookId());
        }

        LocalDate borrowDate = request.getBorrowDate() != null ? request.getBorrowDate() : LocalDate.now();
        if (request.getDueDate().isBefore(borrowDate)) {
            throw new BadRequestException("Due date cannot be before borrow date");
        }

        BorrowRecord borrowRecord = BorrowRecord.builder()
                .bookId(book.getId())
                .studentId(request.getStudentId().trim())
                .borrowDate(borrowDate)
                .dueDate(request.getDueDate())
                .status(BorrowStatus.BORROWED)
                .fineStatus(FineStatus.NONE)
                .build();

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        BorrowRecord savedBorrowRecord = borrowRecordRepository.save(borrowRecord);
        log.info("Borrow created successfully. borrowId={}, bookId={}, studentId={}, remainingCopies={}",
                savedBorrowRecord.getId(), savedBorrowRecord.getBookId(), savedBorrowRecord.getStudentId(), book.getAvailableCopies());
        return mapToResponse(savedBorrowRecord);
    }

    @Transactional
    public BorrowResponse returnBook(Long borrowId) {
        log.info("Return request received. borrowId={}", borrowId);
        BorrowRecord borrowRecord = getBorrowRecordEntityById(borrowId);

        if (borrowRecord.getStatus() == BorrowStatus.RETURNED) {
            throw new BadRequestException("This book has already been returned");
        }

        Book book = bookService.getBookEntityById(borrowRecord.getBookId());
        LocalDate returnedDate = LocalDate.now();

        borrowRecord.setReturnedDate(returnedDate);
        borrowRecord.setStatus(BorrowStatus.RETURNED);

        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        long daysLate = ChronoUnit.DAYS.between(borrowRecord.getDueDate(), returnedDate);
        if (daysLate > 0) {
            log.info("Late return detected. borrowId={}, studentId={}, daysLate={}",
                    borrowId, borrowRecord.getStudentId(), daysLate);
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
            log.info("Fine created for late return. borrowId={}, fineId={}, fineAmount={}, fineStatus={}",
                    borrowId, borrowRecord.getFineId(), borrowRecord.getFineAmount(), borrowRecord.getFineStatus());
        } else {
            borrowRecord.setFineStatus(FineStatus.NONE);
            log.info("Book returned on time. borrowId={}", borrowId);
        }

        BorrowRecord savedBorrowRecord = borrowRecordRepository.save(borrowRecord);
        log.info("Return completed successfully. borrowId={}, bookId={}, availableCopies={}, fineStatus={}",
                borrowId, savedBorrowRecord.getBookId(), book.getAvailableCopies(), savedBorrowRecord.getFineStatus());
        return mapToResponse(savedBorrowRecord);
    }

    @Transactional(readOnly = true)
    public List<BorrowResponse> getAllBorrowings() {
        log.info("Fetching all borrow records");
        List<BorrowResponse> borrowings = borrowRecordRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
        log.info("Borrow records fetched successfully. count={}", borrowings.size());
        return borrowings;
    }

    @Transactional(readOnly = true)
    public BorrowResponse getBorrowingById(Long borrowId) {
        log.info("Fetching borrow record by id. borrowId={}", borrowId);
        BorrowResponse response = mapToResponse(getBorrowRecordEntityById(borrowId));
        log.info("Borrow record fetched successfully. borrowId={}, status={}", borrowId, response.getStatus());
        return response;
    }

    @Transactional(readOnly = true)
    public List<BorrowResponse> getBorrowingsByStudentId(String studentId) {
        log.info("Fetching borrow records by studentId. studentId={}", studentId);
        List<BorrowResponse> borrowings = borrowRecordRepository.findByStudentIdOrderByBorrowDateDesc(studentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
        log.info("Borrow records fetched for studentId. studentId={}, count={}", studentId, borrowings.size());
        return borrowings;
    }

    @Transactional(readOnly = true)
    public List<BorrowResponse> getActiveBorrowings() {
        log.info("Fetching active borrow records");
        List<BorrowResponse> borrowings = borrowRecordRepository.findByStatusOrderByBorrowDateDesc(BorrowStatus.BORROWED)
                .stream()
                .map(this::mapToResponse)
                .toList();
        log.info("Active borrow records fetched successfully. count={}", borrowings.size());
        return borrowings;
    }

    @Transactional
    public BorrowResponse updateFineStatus(Long borrowId, FineStatusUpdateRequest request) {
        log.info("Fine status update request received. borrowId={}, requestedFineId={}, requestedStatus={}",
                borrowId, request.getFineId(), request.getStatus());
        BorrowRecord borrowRecord = getBorrowRecordEntityById(borrowId);

        if (borrowRecord.getFineId() == null || borrowRecord.getFineStatus() == FineStatus.NONE) {
            throw new BadRequestException("No fine exists for this borrow record");
        }

        if (request.getStatus() == FineStatus.NONE) {
            throw new BadRequestException("Fine status cannot be updated to NONE");
        }

        if (request.getFineId() != null && !request.getFineId().isBlank()
                && !request.getFineId().equals(borrowRecord.getFineId())) {
            throw new BadRequestException("Provided fineId does not match the borrow record");
        }

        borrowRecord.setFineStatus(request.getStatus());
        BorrowRecord updatedBorrowRecord = borrowRecordRepository.save(borrowRecord);
        log.info("Fine status updated successfully. borrowId={}, fineId={}, fineStatus={}",
                borrowId, updatedBorrowRecord.getFineId(), updatedBorrowRecord.getFineStatus());
        return mapToResponse(updatedBorrowRecord);
    }

    @Transactional(readOnly = true)
    public BorrowRecord getBorrowRecordEntityById(Long borrowId) {
        log.info("Resolving borrow record entity. borrowId={}", borrowId);
        return borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with id: " + borrowId));
    }

    private BorrowResponse mapToResponse(BorrowRecord borrowRecord) {
        return BorrowResponse.builder()
                .id(borrowRecord.getId())
                .bookId(borrowRecord.getBookId())
                .studentId(borrowRecord.getStudentId())
                .borrowDate(borrowRecord.getBorrowDate())
                .dueDate(borrowRecord.getDueDate())
                .returnedDate(borrowRecord.getReturnedDate())
                .status(borrowRecord.getStatus())
                .fineId(borrowRecord.getFineId())
                .fineAmount(borrowRecord.getFineAmount())
                .fineStatus(borrowRecord.getFineStatus())
                .createdAt(borrowRecord.getCreatedAt())
                .updatedAt(borrowRecord.getUpdatedAt())
                .build();
    }
}
