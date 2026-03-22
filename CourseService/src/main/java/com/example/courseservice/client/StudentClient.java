package com.example.courseservice.client;

import com.example.courseservice.dto.StudentCountResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class StudentClient {

    private final WebClient webClient;
    private final String studentBaseUrl;

    public StudentClient(
            WebClient webClient,
            @Value("${internal.student.base-url}") String studentBaseUrl
    ) {
        this.webClient = webClient;
        this.studentBaseUrl = studentBaseUrl;
    }

    // INTERNAL CALL : enrolled count for a course
    public int getEnrolledCount(String courseId) {
        String normalizedBaseUrl = studentBaseUrl.endsWith("/")
                ? studentBaseUrl.substring(0, studentBaseUrl.length() - 1)
                : studentBaseUrl;
        String url = String.format("%s/students/internal/students/count?courseId=%s", normalizedBaseUrl, courseId);

        StudentCountResponse response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(StudentCountResponse.class)
                .block();

        if (response == null || response.getEnrolledCount() == null) {
            return 0;
        }

        return Integer.parseInt(response.getEnrolledCount());
    }
}
