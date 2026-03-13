package org.example.apigateway.Auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.example.apigateway.Auth.dtos.UserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * @Author Thewa-AlienHub
 * @Created on 03/04/2025
 * @Project API-Gateway-DelieveryYa
 * @Description: All Requests are validate and Authorized by redirecting to Userservice
 */

@Slf4j
@Service
public class AuthService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthService(WebClient.Builder webClientBuilder,
                       @Value("${user.service.url}") String userServiceBaseUrl) {
        this.webClient = webClientBuilder.baseUrl(userServiceBaseUrl).build();
    }

    public Mono<UserResponse> validateToken(String token) {
        log.info("Validating token...");

        String authHeader = token.startsWith("Bearer ") ? token : "Bearer " + token;

        return webClient.post()
                .uri("/auth/validate-token")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .onStatus(
                        status -> status == HttpStatus.UNAUTHORIZED || status == HttpStatus.FORBIDDEN,
                        resp -> {
                            log.warn("Unauthorized token");
                            return Mono.error(new RuntimeException("Unauthorized token"));
                        }
                )
                .onStatus(
                        HttpStatusCode::isError,
                        resp -> {
                            log.error("Unexpected error from user service: HTTP {}", resp.statusCode().value());
                            return Mono.error(new RuntimeException("Unexpected error from user service"));
                        }
                )
                .bodyToMono(UserResponse.class)
                .doOnNext(res -> log.info("Token validated: {}", res))
                .doOnError(e -> log.error("Token validation failed: {}", e.getMessage()));
    }
}
