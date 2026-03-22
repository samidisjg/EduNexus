package com.example.libraryservice.integration.controller;

import com.example.libraryservice.dto.request.BookCreateRequest;
import com.example.libraryservice.dto.response.BookResponse;
import com.example.libraryservice.controller.BookController;
import com.example.libraryservice.exception.GlobalExceptionHandler;
import com.example.libraryservice.service.BookService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BookService bookService;

    @Test
    void createBookShouldReturnCreatedBook() throws Exception {
        when(bookService.createBook(any())).thenReturn(BookResponse.builder()
                .id(1L)
                .title("Book")
                .author("Author")
                .isbn("ISBN-1")
                .totalCopies(5)
                .availableCopies(5)
                .build());

        mockMvc.perform(post("/library/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(BookCreateRequest.builder()
                                .title("Book")
                                .author("Author")
                                .isbn("ISBN-1")
                                .totalCopies(5)
                                .build())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.isbn").value("ISBN-1"));
    }

    @Test
    void getAllBooksShouldReturnBookList() throws Exception {
        when(bookService.getAllBooks()).thenReturn(List.of(
                BookResponse.builder().id(2L).title("Domain-Driven Design").author("Evans").isbn("DDD-1").build()
        ));

        mockMvc.perform(get("/library/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Domain-Driven Design"));
    }
}
