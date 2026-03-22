package com.example.fineservice.integration.controller;

import com.example.fineservice.dto.request.FinePaymentRequest;
import com.example.fineservice.dto.response.FinePaymentResponse;
import com.example.fineservice.dto.response.FineResponse;
import com.example.fineservice.controller.FineController;
import com.example.fineservice.entity.FineStatus;
import com.example.fineservice.entity.PaymentMethod;
import com.example.fineservice.exception.GlobalExceptionHandler;
import com.example.fineservice.service.FinePaymentService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FineController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class FineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FineService fineService;

    @MockitoBean
    private FinePaymentService finePaymentService;

    @Test
    void getAllFinesShouldReturnFineRecords() throws Exception {
        when(fineService.getAllFines()).thenReturn(List.of(
                FineResponse.builder()
                        .fineId("FINE-1")
                        .borrowId(3L)
                        .studentId("STU-3")
                        .status(FineStatus.PENDING)
                        .amount(new BigDecimal("200.00"))
                        .daysLate(2)
                        .build()
        ));

        mockMvc.perform(get("/fines"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fineId").value("FINE-1"))
                .andExpect(jsonPath("$[0].studentId").value("STU-3"));
    }

    @Test
    void payFineShouldReturnPaymentResponse() throws Exception {
        FinePaymentRequest request = FinePaymentRequest.builder()
                .paymentMethod(PaymentMethod.CASH)
                .amount(new BigDecimal("300.00"))
                .referenceNote("desk payment")
                .build();

        when(finePaymentService.payFine(any(), any(FinePaymentRequest.class))).thenReturn(FinePaymentResponse.builder()
                .id(15L)
                .fineId("FINE-15")
                .paymentMethod(PaymentMethod.CASH)
                .amount(new BigDecimal("300.00"))
                .referenceNote("desk payment")
                .build());

        mockMvc.perform(post("/fines/FINE-15/pay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(15))
                .andExpect(jsonPath("$.fineId").value("FINE-15"))
                .andExpect(jsonPath("$.paymentMethod").value("CASH"));
    }

    @Test
    void getFineByFineIdShouldRejectInvalidFineId() throws Exception {
        mockMvc.perform(get("/fines/INVALID$ID"))
                .andExpect(status().isBadRequest());
    }
}
