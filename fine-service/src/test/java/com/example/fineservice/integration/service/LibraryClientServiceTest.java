package com.example.fineservice.integration.service;

import com.example.fineservice.dto.request.LibraryFineStatusUpdateRequest;
import com.example.fineservice.entity.FineStatus;
import com.example.fineservice.exception.LibraryServiceException;
import com.example.fineservice.service.LibraryClientService;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LibraryClientServiceTest {

    private MockWebServer mockWebServer;
    private LibraryClientService libraryClientService;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
        libraryClientService = new LibraryClientService(WebClient.builder());
        ReflectionTestUtils.setField(libraryClientService, "libraryServiceBaseUrl", mockWebServer.url("/").toString());
        ReflectionTestUtils.setField(libraryClientService, "internalApiKey", "secret-key");
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    void updateBorrowFineStatusShouldSendExpectedPatchRequest() throws Exception {
        mockWebServer.enqueue(new MockResponse().setResponseCode(200));

        libraryClientService.updateBorrowFineStatus(80L, LibraryFineStatusUpdateRequest.builder()
                .fineId("FINE-80")
                .status(FineStatus.PAID)
                .build());

        RecordedRequest request = mockWebServer.takeRequest();
        assertEquals("PATCH", request.getMethod());
        assertEquals("/internal/library/borrows/80/fine-status", request.getPath());
        assertEquals("secret-key", request.getHeader("X-INTERNAL-KEY"));
    }

    @Test
    void updateBorrowFineStatusShouldThrowWhenLibraryServiceFails() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(502).setBody("downstream error"));

        assertThrows(LibraryServiceException.class, () -> libraryClientService.updateBorrowFineStatus(1L,
                LibraryFineStatusUpdateRequest.builder()
                        .fineId("FINE-1")
                        .status(FineStatus.PAID)
                        .build()));
    }
}
