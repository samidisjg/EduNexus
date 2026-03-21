package com.example.libraryservice.controller;

import com.example.libraryservice.dto.request.BorrowRequest;
import com.example.libraryservice.dto.response.BorrowResponse;
import com.example.libraryservice.service.BorrowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/library")
@RequiredArgsConstructor
@Tag(name = "Borrowings", description = "Borrowing and return APIs")
@Slf4j
public class BorrowController {

    private final BorrowService borrowService;

    @PostMapping("/borrow")
    @Operation(summary = "Borrow a book")
    public ResponseEntity<BorrowResponse> borrowBook(@Valid @RequestBody BorrowRequest request) {
        log.info("HIT - POST /library/borrow | borrowBook | bookId={}, studentId={}, dueDate={}",
                request.getBookId(), request.getStudentId(), request.getDueDate());
        BorrowResponse response = borrowService.borrowBook(request);
        log.info("SUCCESS - POST /library/borrow | borrowBook | borrowId={}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/return/{borrowId}")
    @Operation(summary = "Return a borrowed book")
    public ResponseEntity<BorrowResponse> returnBook(@PathVariable Long borrowId) {
        log.info("HIT - POST /library/return/{} | returnBook", borrowId);
        BorrowResponse response = borrowService.returnBook(borrowId);
        log.info("SUCCESS - POST /library/return/{} | returnBook | fineStatus={}", borrowId, response.getFineStatus());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/borrowings")
    @Operation(summary = "Get all borrow records")
    public ResponseEntity<List<BorrowResponse>> getAllBorrowings() {
        log.info("HIT - GET /library/borrowings | getAllBorrowings");
        List<BorrowResponse> response = borrowService.getAllBorrowings();
        log.info("SUCCESS - GET /library/borrowings | getAllBorrowings | count={}", response.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/borrowings/{borrowId}")
    @Operation(summary = "Get a borrow record by id")
    public ResponseEntity<BorrowResponse> getBorrowingById(@PathVariable Long borrowId) {
        log.info("HIT - GET /library/borrowings/{} | getBorrowingById", borrowId);
        BorrowResponse response = borrowService.getBorrowingById(borrowId);
        log.info("SUCCESS - GET /library/borrowings/{} | getBorrowingById | status={}",
                borrowId, response.getStatus());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/borrowings/student/{studentId}")
    @Operation(summary = "Get borrow records by student id")
    public ResponseEntity<List<BorrowResponse>> getBorrowingsByStudentId(@PathVariable String studentId) {
        log.info("HIT - GET /library/borrowings/student/{} | getBorrowingsByStudentId", studentId);
        List<BorrowResponse> response = borrowService.getBorrowingsByStudentId(studentId);
        log.info("SUCCESS - GET /library/borrowings/student/{} | getBorrowingsByStudentId | count={}",
                studentId, response.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/borrowings/active")
    @Operation(summary = "Get all active borrow records")
    public ResponseEntity<List<BorrowResponse>> getActiveBorrowings() {
        log.info("HIT - GET /library/borrowings/active | getActiveBorrowings");
        List<BorrowResponse> response = borrowService.getActiveBorrowings();
        log.info("SUCCESS - GET /library/borrowings/active | getActiveBorrowings | count={}", response.size());
        return ResponseEntity.ok(response);
    }
}
