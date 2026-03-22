package com.example.libraryservice.config;

import com.example.libraryservice.dto.response.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@RequiredArgsConstructor
public class GatewayAuthenticationFilter extends OncePerRequestFilter {

    private static final String GATEWAY_HEADER = "X-GATEWAY-KEY";
    private static final String USER_ID_HEADER = "X-User-Id";
    private static final String USER_EMAIL_HEADER = "X-User-Email";
    private static final String USER_ROLE_HEADER = "X-User-Role";

    @Value("${gateway.api.key}")
    private String configuredGatewayKey;

    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return !path.startsWith("/library/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        log.info("Validating gateway-protected request. method={}, path={}", request.getMethod(), request.getRequestURI());
        String gatewayApiKey = request.getHeader(GATEWAY_HEADER);
        String userId = request.getHeader(USER_ID_HEADER);
        String userEmail = request.getHeader(USER_EMAIL_HEADER);
        String userRole = request.getHeader(USER_ROLE_HEADER);

        if (gatewayApiKey == null || !gatewayApiKey.equals(configuredGatewayKey)) {
            log.warn("Rejected library request without valid gateway key. path={}", request.getRequestURI());
            writeUnauthorizedResponse(
                    request,
                    response,
                    "INVALID_GATEWAY_REQUEST",
                    "Request must come through the API Gateway"
            );
            return;
        }

        if (isBlank(userId) || isBlank(userEmail) || isBlank(userRole)) {
            log.warn("Rejected library request with missing auth context. path={}, userId={}, userEmail={}, userRole={}",
                    request.getRequestURI(), userId, userEmail, userRole);
            writeUnauthorizedResponse(
                    request,
                    response,
                    "MISSING_AUTH_CONTEXT",
                    "Validated user context is required from the API Gateway"
            );
            return;
        }

        log.info("Gateway request authorized. path={}, userId={}, userEmail={}, userRole={}",
                request.getRequestURI(), userId, userEmail, userRole);
        filterChain.doFilter(request, response);
    }

    private void writeUnauthorizedResponse(
            HttpServletRequest request,
            HttpServletResponse response,
            String error,
            String message
    ) throws IOException {
        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(error)
                .message(message)
                .path(request.getRequestURI())
                .build();

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
