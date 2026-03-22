package com.example.libraryservice.exception;

public class FineServiceException extends RuntimeException {

    public FineServiceException(String message) {
        super(message);
    }

    public FineServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
