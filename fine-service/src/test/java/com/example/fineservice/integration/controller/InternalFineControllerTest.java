package com.example.fineservice.integration.controller;

import com.example.fineservice.dto.request.FineCalculationRequest;
import com.example.fineservice.dto.response.FineCalculationResponse;
import com.example.fineservice.controller.InternalFineController;
import com.example.fineservice.entity.FineStatus;
import com.example.fineservice.exception.GlobalExceptionHandler;
import com.example.fineservice.service.FineService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InternalFineController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class InternalFineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FineService fineService;

    @Test
    void calculateFineShouldReturnFineCalculationResponse() throws Exception {
        when(fineService.calculateFine(any())).thenReturn(FineCalculationResponse.builder()
                .fineId("FINE-100")
                .amount(new BigDecimal("300.00"))
                .status(FineStatus.PENDING)
                .build());

        mockMvc.perform(post("/internal/fines/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(FineCalculationRequest.builder()
                                .borrowId(100L)
                                .studentId("STU-100")
                                .daysLate(3)
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fineId").value("FINE-100"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }
}
