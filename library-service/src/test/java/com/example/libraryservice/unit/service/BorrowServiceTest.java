package com.example.libraryservice.unit.service;

import com.example.libraryservice.dto.request.BorrowRequest;
import com.example.libraryservice.dto.request.FineStatusUpdateRequest;
import com.example.libraryservice.dto.response.BorrowResponse;
import com.example.libraryservice.dto.response.FineCalculationResponse;
import com.example.libraryservice.entity.Book;
import com.example.libraryservice.entity.BorrowRecord;
import com.example.libraryservice.entity.BorrowStatus;
import com.example.libraryservice.entity.FineStatus;
import com.example.libraryservice.exception.BadRequestException;
import com.example.libraryservice.repository.BookRepository;
import com.example.libraryservice.repository.BorrowRecordRepository;
import com.example.libraryservice.service.BookService;
import com.example.libraryservice.service.BorrowService;
import com.example.libraryservice.service.FineClientService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BorrowServiceTest {

    @Mock
    private BorrowRecordRepository borrowRecordRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private BookService bookService;

    @Mock
    private FineClientService fineClientService;

    @InjectMocks
    private BorrowService borrowService;

    @Test
    void borrowBookShouldCreateBorrowRecordAndReduceAvailableCopies() {
        Book book = Book.builder()
                .id(3L)
                .availableCopies(4)
                .build();

        BorrowRequest request = BorrowRequest.builder()
                .bookId(3L)
                .studentId(" STU-1001 ")
                .borrowDate(LocalDate.of(2026, 3, 20))
                .dueDate(LocalDate.of(2026, 3, 25))
                .build();

        when(bookService.getBookEntityById(3L)).thenReturn(book);
        when(borrowRecordRepository.save(any(BorrowRecord.class))).thenAnswer(invocation -> {
            BorrowRecord record = invocation.getArgument(0);
            record.setId(10L);
            return record;
        });

        BorrowResponse response = borrowService.borrowBook(request);

        assertEquals(10L, response.getId());
        assertEquals("STU-1001", response.getStudentId());
        assertEquals(BorrowStatus.BORROWED, response.getStatus());
        assertEquals(FineStatus.NONE, response.getFineStatus());
        assertEquals(3, book.getAvailableCopies());
        verify(bookRepository).save(book);
    }

    @Test
    void borrowBookShouldRejectWhenNoCopiesAreAvailable() {
        Book book = Book.builder()
                .id(7L)
                .availableCopies(0)
                .build();

        BorrowRequest request = BorrowRequest.builder()
                .bookId(7L)
                .studentId("STU-2")
                .dueDate(LocalDate.now().plusDays(3))
                .build();

        when(bookService.getBookEntityById(7L)).thenReturn(book);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> borrowService.borrowBook(request));

        assertTrue(ex.getMessage().contains("No available copies"));
        verify(borrowRecordRepository, never()).save(any(BorrowRecord.class));
    }

    @Test
    void returnBookShouldCreateFineForLateReturn() {
        BorrowRecord borrowRecord = BorrowRecord.builder()
                .id(11L)
                .bookId(5L)
                .studentId("STU-3")
                .borrowDate(LocalDate.now().minusDays(7))
                .dueDate(LocalDate.now().minusDays(2))
                .status(BorrowStatus.BORROWED)
                .fineStatus(FineStatus.NONE)
                .build();
        Book book = Book.builder()
                .id(5L)
                .availableCopies(1)
                .build();

        when(borrowRecordRepository.findById(11L)).thenReturn(Optional.of(borrowRecord));
        when(bookService.getBookEntityById(5L)).thenReturn(book);
        when(fineClientService.calculateFine(any())).thenReturn(FineCalculationResponse.builder()
                .fineId("FINE-12345678")
                .amount(new BigDecimal("200.00"))
                .status(FineStatus.PENDING)
                .build());
        when(borrowRecordRepository.save(any(BorrowRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BorrowResponse response = borrowService.returnBook(11L);

        assertEquals(BorrowStatus.RETURNED, response.getStatus());
        assertEquals("FINE-12345678", response.getFineId());
        assertEquals(new BigDecimal("200.00"), response.getFineAmount());
        assertEquals(FineStatus.PENDING, response.getFineStatus());
        assertEquals(2, book.getAvailableCopies());

        ArgumentCaptor<com.example.libraryservice.dto.request.FineCalculationRequest> requestCaptor =
                ArgumentCaptor.forClass(com.example.libraryservice.dto.request.FineCalculationRequest.class);
        verify(fineClientService).calculateFine(requestCaptor.capture());
        assertEquals(2L, requestCaptor.getValue().getDaysLate());
    }

    @Test
    void returnBookShouldCreateMinimumFineForSameDayReturn() {
        LocalDate today = LocalDate.now();

        BorrowRecord borrowRecord = BorrowRecord.builder()
                .id(12L)
                .bookId(6L)
                .studentId("STU-4")
                .borrowDate(today)
                .dueDate(today.plusDays(7))
                .status(BorrowStatus.BORROWED)
                .fineStatus(FineStatus.NONE)
                .build();
        Book book = Book.builder()
                .id(6L)
                .availableCopies(2)
                .build();

        when(borrowRecordRepository.findById(12L)).thenReturn(Optional.of(borrowRecord));
        when(bookService.getBookEntityById(6L)).thenReturn(book);
        when(fineClientService.calculateFine(any())).thenReturn(FineCalculationResponse.builder()
                .fineId("FINE-22223333")
                .amount(new BigDecimal("100.00"))
                .status(FineStatus.PENDING)
                .build());
        when(borrowRecordRepository.save(any(BorrowRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BorrowResponse response = borrowService.returnBook(12L);

        assertEquals(BorrowStatus.RETURNED, response.getStatus());
        assertEquals("FINE-22223333", response.getFineId());
        assertEquals(new BigDecimal("100.00"), response.getFineAmount());
        assertEquals(FineStatus.PENDING, response.getFineStatus());
        assertEquals(3, book.getAvailableCopies());

        ArgumentCaptor<com.example.libraryservice.dto.request.FineCalculationRequest> requestCaptor =
                ArgumentCaptor.forClass(com.example.libraryservice.dto.request.FineCalculationRequest.class);
        verify(fineClientService).calculateFine(requestCaptor.capture());
        assertEquals(1L, requestCaptor.getValue().getDaysLate());
    }

    @Test
    void updateFineStatusShouldRejectMismatchedFineId() {
        BorrowRecord borrowRecord = BorrowRecord.builder()
                .id(22L)
                .fineId("FINE-AAAA1111")
                .fineStatus(FineStatus.PENDING)
                .status(BorrowStatus.RETURNED)
                .build();

        when(borrowRecordRepository.findById(22L)).thenReturn(Optional.of(borrowRecord));

        FineStatusUpdateRequest request = FineStatusUpdateRequest.builder()
                .fineId("FINE-BBBB2222")
                .status(FineStatus.PAID)
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> borrowService.updateFineStatus(22L, request));

        assertEquals("Provided fineId does not match the borrow record", ex.getMessage());
        verify(borrowRecordRepository, never()).save(any(BorrowRecord.class));
    }
}
