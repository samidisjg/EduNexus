package com.sliit.studentservice.services.internal;

import com.sliit.studentservice.dtos.response.CourseAvailabilityResponseDto;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

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
}
