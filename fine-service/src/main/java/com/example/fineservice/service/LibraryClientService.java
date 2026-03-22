package com.example.fineservice.service;

import com.example.fineservice.dto.request.LibraryFineStatusUpdateRequest;
import com.example.fineservice.exception.LibraryServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@RequiredArgsConstructor
@Slf4j
public class LibraryClientService {

    private static final String INTERNAL_HEADER = "X-INTERNAL-KEY";

    private final WebClient.Builder webClientBuilder;

    @Value("${library.service.base-url}")
    private String libraryServiceBaseUrl;

    @Value("${internal.api.key}")
    private String internalApiKey;

    public void updateBorrowFineStatus(Long borrowId, LibraryFineStatusUpdateRequest request) {
        log.info("Calling Library Service to update fine status. borrowId={}, fineId={}, status={}",
                borrowId, request.getFineId(), request.getStatus());
        try {
            webClientBuilder
                    .baseUrl(libraryServiceBaseUrl)
                    .build()
                    .patch()
                    .uri("/internal/library/borrows/{borrowId}/fine-status", borrowId)
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .header(INTERNAL_HEADER, internalApiKey)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(
                            HttpStatusCode::isError,
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(body -> new LibraryServiceException("Library Service returned an error: " + body))
                    )
                    .toBodilessEntity()
                    .block();

            log.info("Library Service fine status update succeeded. borrowId={}, fineId={}",
                    borrowId, request.getFineId());
        } catch (WebClientResponseException ex) {
            log.error("Library Service responded with status {} and body {}",
                    ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
            throw new LibraryServiceException("Library Service error: " + ex.getResponseBodyAsString(), ex);
        } catch (WebClientRequestException ex) {
            log.error("Unable to connect to Library Service", ex);
            throw new LibraryServiceException("Library Service is unavailable. Please try again later.", ex);
        } catch (LibraryServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error while calling Library Service", ex);
            throw new LibraryServiceException("Failed to update fine status in Library Service", ex);
        }
    }
}
