package com.example.libraryservice.controller;

import com.example.libraryservice.dto.request.BookCreateRequest;
import com.example.libraryservice.dto.request.BookUpdateRequest;
import com.example.libraryservice.dto.response.BookResponse;
import com.example.libraryservice.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/library/books")
@RequiredArgsConstructor
@Tag(name = "Books", description = "Book management APIs")
@Slf4j
public class BookController {

    private final BookService bookService;

    @PostMapping
    @Operation(summary = "Create a new book")
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookCreateRequest request) {
        log.info("HIT - POST /library/books | createBook | title={}, isbn={}", request.getTitle(), request.getIsbn());
        BookResponse response = bookService.createBook(request);
        log.info("SUCCESS - POST /library/books | createBook | bookId={}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all books")
    public ResponseEntity<List<BookResponse>> getAllBooks() {
        log.info("HIT - GET /library/books | getAllBooks");
        List<BookResponse> response = bookService.getAllBooks();
        log.info("SUCCESS - GET /library/books | getAllBooks | count={}", response.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single book by id")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        log.info("HIT - GET /library/books/{} | getBookById", id);
        BookResponse response = bookService.getBookById(id);
        log.info("SUCCESS - GET /library/books/{} | getBookById | isbn={}", id, response.getIsbn());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a book")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookUpdateRequest request
    ) {
        log.info("HIT - PUT /library/books/{} | updateBook | title={}, isbn={}", id, request.getTitle(), request.getIsbn());
        BookResponse response = bookService.updateBook(id, request);
        log.info("SUCCESS - PUT /library/books/{} | updateBook | availableCopies={}", id, response.getAvailableCopies());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a book")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        log.info("HIT - DELETE /library/books/{} | deleteBook", id);
        bookService.deleteBook(id);
        log.info("SUCCESS - DELETE /library/books/{} | deleteBook", id);
        return ResponseEntity.noContent().build();
    }
}
