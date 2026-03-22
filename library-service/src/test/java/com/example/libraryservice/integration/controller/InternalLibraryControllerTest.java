package com.example.libraryservice.integration.controller;

import com.example.libraryservice.dto.request.FineStatusUpdateRequest;
import com.example.libraryservice.dto.response.BorrowResponse;
import com.example.libraryservice.entity.BorrowStatus;
import com.example.libraryservice.entity.FineStatus;
import com.example.libraryservice.controller.InternalLibraryController;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InternalLibraryController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class InternalLibraryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BorrowService borrowService;

    @Test
    void updateFineStatusShouldReturnUpdatedBorrowRecord() throws Exception {
        when(borrowService.updateFineStatus(any(), any())).thenReturn(BorrowResponse.builder()
                .id(50L)
                .status(BorrowStatus.RETURNED)
                .fineStatus(FineStatus.PAID)
                .fineId("FINE-50")
                .build());

        mockMvc.perform(patch("/internal/library/borrows/50/fine-status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(FineStatusUpdateRequest.builder()
                                .fineId("FINE-50")
                                .status(FineStatus.PAID)
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fineStatus").value("PAID"));
    }
}
