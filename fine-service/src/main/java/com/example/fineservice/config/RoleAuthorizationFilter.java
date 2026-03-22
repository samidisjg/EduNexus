package com.example.fineservice.config;

import com.example.fineservice.dto.response.ApiErrorResponse;
import com.example.fineservice.exception.ForbiddenException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 30)
@RequiredArgsConstructor
public class RoleAuthorizationFilter extends OncePerRequestFilter {

    private static final String USER_ROLE_HEADER = "X-User-Role";
    private static final Set<String> STAFF_ROLES = Set.of("ADMIN", "INSTRUCTOR");
    private static final Set<String> AUTHENTICATED_ROLES = Set.of("ADMIN", "INSTRUCTOR", "USER");

    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().startsWith("/fines/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            authorize(request);
            filterChain.doFilter(request, response);
        } catch (ForbiddenException ex) {
            log.warn("Authorization denied for path={}: {}", request.getRequestURI(), ex.getMessage());
            writeForbiddenResponse(request, response, ex.getMessage());
        }
    }

    private void authorize(HttpServletRequest request) {
        String role = normalizeRole(request.getHeader(USER_ROLE_HEADER));
        String path = request.getServletPath();
        String method = request.getMethod();

        if (HttpMethod.OPTIONS.matches(method) || HttpMethod.HEAD.matches(method)) {
            return;
        }

        if (HttpMethod.GET.matches(method) && path.equals("/fines")) {
            requireRole(role, STAFF_ROLES, "Only ADMIN or INSTRUCTOR can access all fines");
            return;
        }

        if (path.startsWith("/fines/")) {
            requireRole(role, AUTHENTICATED_ROLES, "Authenticated role is required");
        }
    }

    private void requireRole(String role, Set<String> allowedRoles, String message) {
        if (role == null || !allowedRoles.contains(role)) {
            throw new ForbiddenException(message);
        }
    }

    private String normalizeRole(String role) {
        return role == null ? null : role.trim().toUpperCase(Locale.ROOT);
    }

    private void writeForbiddenResponse(HttpServletRequest request, HttpServletResponse response, String message)
            throws IOException {
        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error("FORBIDDEN")
                .message(message)
                .path(request.getRequestURI())
                .build();

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
