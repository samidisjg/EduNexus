package com.sliit.studentservice.services.internal;

import com.sliit.studentservice.dtos.response.CourseAvailabilityResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class CourseServiceClient {

    private final WebClient webClient;
    private final String baseUrl;

    public CourseServiceClient(
            @Value("${services.course-service.base-url}") String baseUrl,
            WebClient webClient
    ) {
        this.baseUrl = baseUrl == null ? "" : baseUrl.trim();
        this.webClient = webClient;
    }

    public CourseAvailabilityResponseDto getCourseAvailability(String courseId) {
        if (baseUrl.isBlank()) {
            return sampleAvailability(courseId);
        }

        String url = String.format("%s/course-service/internal/courses/%s/availability", baseUrl, courseId);

        try {
            CourseAvailabilityResponseDto response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .defaultIfEmpty("CourseService error")
                                    .flatMap(body -> Mono.error(new IllegalStateException(body))))
                    .bodyToMono(CourseAvailabilityResponseDto.class)
                    .block();

            if (response == null) {
                throw new IllegalStateException("CourseService returned empty response");
            }

            return response;
        } catch (Exception ex) {
            log.error("Failed to call CourseService. courseId={}", courseId, ex);
            throw new IllegalStateException("CourseService is unavailable", ex);
        }
    }

    private CourseAvailabilityResponseDto sampleAvailability(String courseId) {
        boolean isFull = courseId != null && courseId.toUpperCase().endsWith("-FULL");
        return CourseAvailabilityResponseDto.builder()
                .courseId(courseId)
                .available(!isFull)
                .remainingSeats(isFull ? 0 : 10)
                .build();
    }
}
