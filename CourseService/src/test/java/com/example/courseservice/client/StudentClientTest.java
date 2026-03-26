package com.example.courseservice.client;

import com.example.courseservice.dto.StudentCountResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentClientTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private WebClient webClient;

    @Test
    void getEnrolledCountShouldParseCountAndTrimTrailingSlashInBaseUrl() {
        StudentCountResponse response = new StudentCountResponse();
        response.setCourseId("CS101");
        response.setEnrolledCount("42");

        when(webClient.get().uri(anyString()).retrieve().bodyToMono(eq(StudentCountResponse.class)))
                .thenReturn(Mono.just(response));

        StudentClient client = new StudentClient(webClient, "http://localhost:9095/students-service/");

        int count = client.getEnrolledCount("CS101");

        assertEquals(42, count);
        verify(webClient.get()).uri("http://localhost:9095/students-service/students/internal/students/count?courseId=CS101");
    }

    @Test
    void getEnrolledCountShouldReturnZeroWhenResponseBodyIsNull() {
        when(webClient.get().uri(anyString()).retrieve().bodyToMono(eq(StudentCountResponse.class)))
                .thenReturn(Mono.empty());

        StudentClient client = new StudentClient(webClient, "http://localhost:9095/students-service");

        int count = client.getEnrolledCount("CS101");

        assertEquals(0, count);
    }

    @Test
    void getEnrolledCountShouldReturnZeroWhenEnrolledCountIsNull() {
        StudentCountResponse response = new StudentCountResponse();
        response.setCourseId("CS101");
        response.setEnrolledCount(null);

        when(webClient.get().uri(anyString()).retrieve().bodyToMono(eq(StudentCountResponse.class)))
                .thenReturn(Mono.just(response));

        StudentClient client = new StudentClient(webClient, "http://localhost:9095/students-service");

        int count = client.getEnrolledCount("CS101");

        assertEquals(0, count);
    }

    @Test
    void getEnrolledCountShouldThrowWhenCountIsNotNumeric() {
        StudentCountResponse response = new StudentCountResponse();
        response.setCourseId("CS101");
        response.setEnrolledCount("invalid");

        when(webClient.get().uri(anyString()).retrieve().bodyToMono(eq(StudentCountResponse.class)))
                .thenReturn(Mono.just(response));

        StudentClient client = new StudentClient(webClient, "http://localhost:9095/students-service");

        assertThrows(NumberFormatException.class, () -> client.getEnrolledCount("CS101"));
    }
}

