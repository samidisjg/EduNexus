package com.sliit.studentservice.services.internal;

import com.sliit.studentservice.dtos.response.CourseAvailabilityResponseDto;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CourseServiceClientTest {

    @Test
    void returnsSampleAvailabilityWhenBaseUrlIsBlank() {
        WebClient webClient = mock(WebClient.class);
        CourseServiceClient client = new CourseServiceClient("   ", webClient);

        CourseAvailabilityResponseDto available = client.getCourseAvailability("C001");
        CourseAvailabilityResponseDto full = client.getCourseAvailability("C001-FULL");

        assertTrue(available.getAvailable());
        assertEquals(10, available.getRemainingSeats());
        assertFalse(full.getAvailable());
        assertEquals(0, full.getRemainingSeats());
    }

    @Test
    void throwsIllegalStateWhenRemoteCallFails() {
        WebClient webClient = mock(WebClient.class);
        when(webClient.get()).thenThrow(new RuntimeException("down"));

        CourseServiceClient client = new CourseServiceClient("http://localhost:9096", webClient);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> client.getCourseAvailability("C001"));

        assertEquals("CourseService is unavailable", ex.getMessage());
    }

    @Test
    void returnsAvailabilityWhenRemoteCallSucceeds() {
        ExchangeFunction exchangeFunction = request -> {
            assertEquals("http://course-service/course-service/internal/courses/C001/availability", request.url().toString());
            return Mono.just(ClientResponse.create(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body("{\"courseId\":\"C001\",\"available\":true,\"remainingSeats\":7}")
                    .build());
        };

        WebClient webClient = WebClient.builder().exchangeFunction(exchangeFunction).build();
        CourseServiceClient client = new CourseServiceClient("http://course-service", webClient);

        CourseAvailabilityResponseDto response = client.getCourseAvailability("C001");

        assertNotNull(response);
        assertEquals("C001", response.getCourseId());
        assertTrue(response.getAvailable());
        assertEquals(7, response.getRemainingSeats());
    }

    @Test
    void throwsIllegalStateWhenRemoteCallReturnsEmptyBody() {
        ExchangeFunction exchangeFunction = request -> Mono.just(ClientResponse.create(HttpStatus.OK).build());

        WebClient webClient = WebClient.builder().exchangeFunction(exchangeFunction).build();
        CourseServiceClient client = new CourseServiceClient("http://course-service", webClient);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> client.getCourseAvailability("C001"));

        assertEquals("CourseService is unavailable", ex.getMessage());
        assertNotNull(ex.getCause());
        assertEquals("CourseService returned empty response", ex.getCause().getMessage());
    }
}
