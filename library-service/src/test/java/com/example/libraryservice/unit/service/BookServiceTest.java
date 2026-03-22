package com.example.libraryservice.unit.service;

import com.example.libraryservice.dto.request.BookCreateRequest;
import com.example.libraryservice.dto.request.BookUpdateRequest;
import com.example.libraryservice.dto.response.BookResponse;
import com.example.libraryservice.entity.Book;
import com.example.libraryservice.entity.BorrowStatus;
import com.example.libraryservice.exception.BadRequestException;
import com.example.libraryservice.exception.ResourceNotFoundException;
import com.example.libraryservice.repository.BookRepository;
import com.example.libraryservice.repository.BorrowRecordRepository;
import com.example.libraryservice.service.BookService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private BorrowRecordRepository borrowRecordRepository;

    @InjectMocks
    private BookService bookService;

    @Test
    void createBookShouldTrimFieldsAndSetAvailableCopies() {
        when(bookRepository.existsByIsbn("ISBN-123")).thenReturn(false);
        when(bookRepository.save(any(Book.class))).thenAnswer(invocation -> {
            Book book = invocation.getArgument(0);
            book.setId(1L);
            return book;
        });

        BookResponse response = bookService.createBook(BookCreateRequest.builder()
                .title(" Clean Code ")
                .author(" Robert Martin ")
                .isbn(" ISBN-123 ")
                .totalCopies(5)
                .build());

        assertEquals(1L, response.getId());
        assertEquals("Clean Code", response.getTitle());
        assertEquals("Robert Martin", response.getAuthor());
        assertEquals("ISBN-123", response.getIsbn());
        assertEquals(5, response.getAvailableCopies());
    }

    @Test
    void updateBookShouldRejectReducingCopiesBelowBorrowedCount() {
        Book book = Book.builder()
                .id(2L)
                .title("Existing")
                .author("Author")
                .isbn("ISBN-OLD")
                .totalCopies(5)
                .availableCopies(1)
                .build();

        when(bookRepository.findById(2L)).thenReturn(Optional.of(book));
        when(bookRepository.existsByIsbnAndIdNot("ISBN-NEW", 2L)).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> bookService.updateBook(2L,
                BookUpdateRequest.builder()
                        .title("Updated")
                        .author("Author")
                        .isbn("ISBN-NEW")
                        .totalCopies(3)
                        .build()));

        assertTrue(ex.getMessage().contains("currently borrowed copies"));
        verify(bookRepository, never()).save(any(Book.class));
    }

    @Test
    void deleteBookShouldRejectWhenBookHasActiveBorrowings() {
        Book book = Book.builder()
                .id(3L)
                .isbn("ISBN-33")
                .build();

        when(bookRepository.findById(3L)).thenReturn(Optional.of(book));
        when(borrowRecordRepository.existsByBookIdAndStatus(3L, BorrowStatus.BORROWED)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> bookService.deleteBook(3L));

        assertEquals("Cannot delete a book that has active borrow records", ex.getMessage());
        verify(bookRepository, never()).delete(any(Book.class));
    }

    @Test
    void getBookByIdShouldThrowWhenBookIsMissing() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bookService.getBookById(99L));
    }

    @Test
    void getAllBooksShouldMapRepositoryResults() {
        when(bookRepository.findAll()).thenReturn(List.of(
                Book.builder().id(4L).title("Book").author("Author").isbn("ISBN-4").totalCopies(2).availableCopies(2).build()
        ));

        List<BookResponse> books = bookService.getAllBooks();

        assertEquals(1, books.size());
        assertEquals("ISBN-4", books.get(0).getIsbn());
    }
}
