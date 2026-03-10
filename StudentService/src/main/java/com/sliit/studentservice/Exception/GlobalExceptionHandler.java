package com.sliit.studentservice.Exception;

import com.sliit.studentservice.dtos.response.ErrorResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponseDto> handleBadRequest(BadRequestException ex, HttpServletRequest req) {
        log.warn("Bad request. path={}, message={}", req.getRequestURI(), ex.getMessage());
        return ResponseEntity.badRequest().body(
                ErrorResponseDto.builder()
                        .timestamp(LocalDateTime.now())
                        .status(400)
                        .error("BAD_REQUEST")
                        .message(ex.getMessage())
                        .path(req.getRequestURI())
                        .build()
        );
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNotFound(NotFoundException ex, HttpServletRequest req) {
        log.warn("Not found. path={}, message={}", req.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(404).body(
                ErrorResponseDto.builder()
                        .timestamp(LocalDateTime.now())
                        .status(404)
                        .error("NOT_FOUND")
                        .message(ex.getMessage())
                        .path(req.getRequestURI())
                        .build()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("Unhandled error. path={}", req.getRequestURI(), ex);
        return ResponseEntity.status(500).body(
                ErrorResponseDto.builder()
                        .timestamp(LocalDateTime.now())
                        .status(500)
                        .error("INTERNAL_SERVER_ERROR")
                        .message("Something went wrong")
                        .path(req.getRequestURI())
                        .build()
        );
    }
}
