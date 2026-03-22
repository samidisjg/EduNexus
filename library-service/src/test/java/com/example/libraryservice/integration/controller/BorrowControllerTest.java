package com.example.libraryservice.integration.controller;

import com.example.libraryservice.dto.request.BorrowRequest;
import com.example.libraryservice.dto.response.BorrowResponse;
import com.example.libraryservice.entity.BorrowStatus;
import com.example.libraryservice.entity.FineStatus;
import com.example.libraryservice.controller.BorrowController;
import com.example.libraryservice.exception.GlobalExceptionHandler;
import com.example.libraryservice.service.BorrowService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BorrowController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class BorrowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BorrowService borrowService;

    @Test
    void borrowBookShouldReturnCreatedResponse() throws Exception {
        BorrowRequest request = BorrowRequest.builder()
                .bookId(9L)
                .studentId("STU-42")
                .dueDate(LocalDate.of(2026, 3, 30))
                .build();

        BorrowResponse response = BorrowResponse.builder()
                .id(1L)
                .bookId(9L)
                .studentId("STU-42")
                .status(BorrowStatus.BORROWED)
                .fineStatus(FineStatus.NONE)
                .dueDate(LocalDate.of(2026, 3, 30))
                .build();

        when(borrowService.borrowBook(any(BorrowRequest.class))).thenReturn(response);

        mockMvc.perform(post("/library/borrow")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.studentId").value("STU-42"))
                .andExpect(jsonPath("$.status").value("BORROWED"));
    }

    @Test
    void getActiveBorrowingsShouldReturnBorrowRecords() throws Exception {
        BorrowResponse response = BorrowResponse.builder()
                .id(8L)
                .bookId(4L)
                .studentId("STU-55")
                .status(BorrowStatus.BORROWED)
                .fineStatus(FineStatus.NONE)
                .build();

        when(borrowService.getActiveBorrowings()).thenReturn(List.of(response));

        mockMvc.perform(get("/library/borrowings/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(8))
                .andExpect(jsonPath("$[0].studentId").value("STU-55"));
    }
}
