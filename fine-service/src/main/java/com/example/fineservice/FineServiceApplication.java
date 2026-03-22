package com.example.fineservice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
@Slf4j
public class FineServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(FineServiceApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logStartupSuccess() {
        log.info("=================== Fine Service ===================");
        log.info("Fine Service started successfully");
    }
}
