package com.example.fineservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        String method = request.getMethod();
        String path = request.getRequestURI();
        String query = request.getQueryString();
        String requestPath = query == null ? path : path + "?" + query;

        log.info("HTTP request started: method={}, path={}, remoteAddr={}", method, requestPath, request.getRemoteAddr());

        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = System.currentTimeMillis() - startTime;
            int status = response.getStatus();

            if (status >= 500) {
                log.error("HTTP request completed with server error: method={}, path={}, status={}, durationMs={}",
                        method, requestPath, status, durationMs);
            } else if (status >= 400) {
                log.warn("HTTP request completed with client error: method={}, path={}, status={}, durationMs={}",
                        method, requestPath, status, durationMs);
            } else {
                log.info("HTTP request completed: method={}, path={}, status={}, durationMs={}",
                        method, requestPath, status, durationMs);
            }
        }
    }
}
