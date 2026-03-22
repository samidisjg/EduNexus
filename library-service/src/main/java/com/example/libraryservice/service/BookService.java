package com.example.libraryservice.service;

import com.example.libraryservice.dto.request.BookCreateRequest;
import com.example.libraryservice.dto.request.BookUpdateRequest;
import com.example.libraryservice.dto.response.BookResponse;
import com.example.libraryservice.entity.Book;
import com.example.libraryservice.entity.BorrowStatus;
import com.example.libraryservice.exception.BadRequestException;
import com.example.libraryservice.exception.ResourceNotFoundException;
import com.example.libraryservice.repository.BookRepository;
import com.example.libraryservice.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    @Transactional
    public BookResponse createBook(BookCreateRequest request) {
        log.info("Creating book. title={}, author={}, isbn={}, totalCopies={}",
                request.getTitle(), request.getAuthor(), request.getIsbn(), request.getTotalCopies());
        validateUniqueIsbn(request.getIsbn(), null);

        Book book = Book.builder()
                .title(request.getTitle().trim())
                .author(request.getAuthor().trim())
                .isbn(request.getIsbn().trim())
                .totalCopies(request.getTotalCopies())
                .availableCopies(request.getTotalCopies())
                .build();

        Book savedBook = bookRepository.save(book);
        log.info("Book created successfully. bookId={}, isbn={}, availableCopies={}",
                savedBook.getId(), savedBook.getIsbn(), savedBook.getAvailableCopies());
        return mapToResponse(savedBook);
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getAllBooks() {
        log.info("Fetching all books");
        List<BookResponse> books = bookRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
        log.info("Books fetched successfully. count={}", books.size());
        return books;
    }

    @Transactional(readOnly = true)
    public BookResponse getBookById(Long id) {
        log.info("Fetching book by id. bookId={}", id);
        BookResponse response = mapToResponse(getBookEntityById(id));
        log.info("Book fetched successfully. bookId={}, isbn={}", id, response.getIsbn());
        return response;
    }

    @Transactional
    public BookResponse updateBook(Long id, BookUpdateRequest request) {
        log.info("Updating book. bookId={}, requestedIsbn={}, requestedTotalCopies={}",
                id, request.getIsbn(), request.getTotalCopies());
        Book book = getBookEntityById(id);
        validateUniqueIsbn(request.getIsbn(), id);

        int borrowedCopies = book.getTotalCopies() - book.getAvailableCopies();
        if (request.getTotalCopies() < borrowedCopies) {
            throw new BadRequestException("Total copies cannot be less than currently borrowed copies");
        }

        book.setTitle(request.getTitle().trim());
        book.setAuthor(request.getAuthor().trim());
        book.setIsbn(request.getIsbn().trim());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getTotalCopies() - borrowedCopies);

        Book updatedBook = bookRepository.save(book);
        log.info("Book updated successfully. bookId={}, totalCopies={}, availableCopies={}",
                updatedBook.getId(), updatedBook.getTotalCopies(), updatedBook.getAvailableCopies());
        return mapToResponse(updatedBook);
    }

    @Transactional
    public void deleteBook(Long id) {
        log.info("Deleting book. bookId={}", id);
        Book book = getBookEntityById(id);

        if (borrowRecordRepository.existsByBookIdAndStatus(book.getId(), BorrowStatus.BORROWED)) {
            throw new BadRequestException("Cannot delete a book that has active borrow records");
        }

        bookRepository.delete(book);
        log.info("Book deleted successfully. bookId={}, isbn={}", id, book.getIsbn());
    }

    @Transactional(readOnly = true)
    public Book getBookEntityById(Long id) {
        log.info("Resolving book entity. bookId={}", id);
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    }

    private void validateUniqueIsbn(String isbn, Long existingBookId) {
        String trimmedIsbn = isbn.trim();
        boolean exists = existingBookId == null
                ? bookRepository.existsByIsbn(trimmedIsbn)
                : bookRepository.existsByIsbnAndIdNot(trimmedIsbn, existingBookId);

        if (exists) {
            log.warn("Duplicate ISBN detected. isbn={}, existingBookId={}", trimmedIsbn, existingBookId);
            throw new BadRequestException("A book with the same ISBN already exists");
        }
    }

    private BookResponse mapToResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }
}
