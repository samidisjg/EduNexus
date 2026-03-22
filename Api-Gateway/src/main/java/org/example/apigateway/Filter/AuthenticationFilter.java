package org.example.apigateway.Filter;

import lombok.extern.slf4j.Slf4j;
import org.example.apigateway.Auth.AuthService;
import org.example.apigateway.config.GatewayConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * @Author Thewa-AlienHub
 * @Created on 03/04/2025
 * @Project API-Gateway-DelieveryYa
 * @Description: All Requests are Filter & Redirect the Relevant Domains
 */

@Slf4j
@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {
    private static final String GATEWAY_HEADER = "X-GATEWAY-KEY";

    @Autowired
    private GatewayConfig gatewayConfig;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Autowired
    private AuthService authService;

    @Override
    public int getOrder() {
        return -1; // Filter execution order
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        log.info("Incoming request: {} {}", request.getMethod(), path);

        // Skip auth for open endpoints
        if (isOpenEndpoint(path)) {
            log.info("Bypassing auth for open endpoint: {}", path);
            return chain.filter(exchange);
        }

        // Extract Authorization Header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        // Log incoming request and auth header status
        log.info("Incoming request: {} {}", request.getMethod(), request.getURI());
        if (authHeader == null) {
            log.warn("Missing Authorization Header for request: {}", request.getURI());
            return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        // Validate token
        if (!authHeader.startsWith("Bearer ")) {
            log.warn("Invalid Authorization Header format for request: {}", request.getURI());
            return onError(exchange, "Invalid Authorization Header format", HttpStatus.UNAUTHORIZED);
        }

        // Validate token with the AuthService
        return authService.validateToken(authHeader)
                .flatMap(user -> {
                    // Log successful token validation
                    log.info("Token validated successfully for user: {}", user.getData().getUserEmail());

                    // Create the modified request with additional headers
                    ServerHttpRequest modifiedRequest = request.mutate()
                            .header("X-User-Id", String.valueOf(user.getData().getUserId()))
                            .header("X-User-Role", user.getData().getRole())
                            .header("X-User-Email", user.getData().getUserEmail())
                            .header("X-Username", user.getData().getUserName())
                            .header(GATEWAY_HEADER, gatewayConfig.getApiKey())
                            .build();

                    // Log the URI that is being forwarded to the service
                    log.info("Forwarding to URI: {}", modifiedRequest.getURI());

                    // Proceed with the filtered request
                    return chain.filter(exchange.mutate().request(modifiedRequest).build())
                            .doOnSuccess(aVoid -> {
                                URI routedUri = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR);
                                if (routedUri != null) {
                                    log.info("Final forwarded URI: {}", routedUri);
                                } else {
                                    log.warn("GATEWAY_REQUEST_URL_ATTR not set yet.");
                                }
                            });
                })
                .onErrorResume(ex -> {
                    // Log the error and return 401 Unauthorized
                    log.error("Error validating token for request {}: {}", request.getURI(), ex.getMessage());
                    return onError(exchange, "Invalid Token", HttpStatus.UNAUTHORIZED);
                });

    }

    // Method to handle errors
    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();

        // Set status code and log error response
        response.setStatusCode(status);
        log.error("Responding with status {} and message: {}", status, message);

        // Create the error message body
        byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    private boolean isOpenEndpoint(String path) {
        List<String> openEndpoints = gatewayConfig.getOpenEndpoints();
        boolean match = openEndpoints.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
        if (match) {
            log.info("🔓 Matched open endpoint: {}", path);
        }
        return match;
    }
}
