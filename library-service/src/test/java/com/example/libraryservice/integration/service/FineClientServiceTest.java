package com.example.libraryservice.integration.service;

import com.example.libraryservice.dto.request.FineCalculationRequest;
import com.example.libraryservice.dto.response.FineCalculationResponse;
import com.example.libraryservice.entity.FineStatus;
import com.example.libraryservice.exception.FineServiceException;
import com.example.libraryservice.service.FineClientService;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FineClientServiceTest {

    private MockWebServer mockWebServer;
    private FineClientService fineClientService;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
        fineClientService = new FineClientService(WebClient.builder());
        ReflectionTestUtils.setField(fineClientService, "fineServiceBaseUrl", mockWebServer.url("/").toString());
        ReflectionTestUtils.setField(fineClientService, "internalApiKey", "secret-key");
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    void calculateFineShouldSendExpectedRequestAndParseResponse() throws Exception {
        mockWebServer.enqueue(new MockResponse()
                .setHeader("Content-Type", "application/json")
                .setBody("""
                        {"fineId":"FINE-42","amount":200.00,"status":"PENDING"}
                        """));

        FineCalculationResponse response = fineClientService.calculateFine(FineCalculationRequest.builder()
                .borrowId(42L)
                .studentId("STU-42")
                .daysLate(2L)
                .build());

        assertEquals("FINE-42", response.getFineId());
        assertEquals(new BigDecimal("200.00"), response.getAmount());
        assertEquals(FineStatus.PENDING, response.getStatus());

        RecordedRequest request = mockWebServer.takeRequest();
        assertEquals("POST", request.getMethod());
        assertEquals("/internal/fines/calculate", request.getPath());
        assertEquals("secret-key", request.getHeader("X-INTERNAL-KEY"));
    }

    @Test
    void calculateFineShouldThrowWhenServiceReturnsError() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(500).setBody("failed"));

        assertThrows(FineServiceException.class, () -> fineClientService.calculateFine(FineCalculationRequest.builder()
                .borrowId(1L)
                .studentId("STU-1")
                .daysLate(1L)
                .build()));
    }
}
