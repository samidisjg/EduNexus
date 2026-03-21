package com.example.libraryservice.service;

import com.example.libraryservice.dto.request.FineCalculationRequest;
import com.example.libraryservice.dto.response.FineCalculationResponse;
import com.example.libraryservice.exception.FineServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Service
@RequiredArgsConstructor
public class FineClientService {

    private static final String INTERNAL_HEADER = "X-INTERNAL-KEY";

    private final WebClient.Builder webClientBuilder;

    @Value("${fine.service.base-url}")
    private String fineServiceBaseUrl;

    @Value("${internal.api.key}")
    private String internalApiKey;

    public FineCalculationResponse calculateFine(FineCalculationRequest request) {
        log.info("Calling Fine Service. borrowId={}, studentId={}, daysLate={}",
                request.getBorrowId(), request.getStudentId(), request.getDaysLate());
        try {
            FineCalculationResponse response = webClientBuilder
                    .baseUrl(fineServiceBaseUrl)
                    .build()
                    .post()
                    .uri("/internal/fines/calculate")
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .header(INTERNAL_HEADER, internalApiKey)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(
                            HttpStatusCode::isError,
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(body -> new FineServiceException("Fine Service returned an error: " + body))
                    )
                    .bodyToMono(FineCalculationResponse.class)
                    .block();

            if (response == null) {
                throw new FineServiceException("Fine Service returned an empty response");
            }

            log.info("Fine Service call succeeded. borrowId={}, fineId={}, amount={}, status={}",
                    request.getBorrowId(), response.getFineId(), response.getAmount(), response.getStatus());
            return response;
        } catch (WebClientResponseException ex) {
            log.error("Fine Service responded with status {} and body {}", ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
            throw new FineServiceException("Fine Service error: " + ex.getResponseBodyAsString(), ex);
        } catch (WebClientRequestException ex) {
            log.error("Unable to connect to Fine Service", ex);
            throw new FineServiceException("Fine Service is unavailable. Please try again later.", ex);
        } catch (FineServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error while calling Fine Service", ex);
            throw new FineServiceException("Failed to calculate fine using Fine Service", ex);
        }
    }
}
