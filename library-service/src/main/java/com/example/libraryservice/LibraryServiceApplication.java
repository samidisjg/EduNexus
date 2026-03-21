package com.example.libraryservice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.event.EventListener;

@SpringBootApplication
@Slf4j
public class LibraryServiceApplication {

    @Value("${server.port}")
    private String serverPort;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Value("${internal.api.key}")
    private String internalApiKey;

    @Value("${gateway.api.key}")
    private String gatewayApiKey;

    public static void main(String[] args) {
        SpringApplication.run(LibraryServiceApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logStartupSuccess() {
        log.info("=================== Library Service ===================");
        log.info("Library Service started successfully");
    }
}
