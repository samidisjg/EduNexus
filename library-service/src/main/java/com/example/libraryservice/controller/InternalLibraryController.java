package com.example.libraryservice.controller;

import com.example.libraryservice.dto.request.FineStatusUpdateRequest;
import com.example.libraryservice.dto.response.BorrowResponse;
import com.example.libraryservice.service.BorrowService;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Hidden
@RestController
@RequestMapping("/internal/library")
@RequiredArgsConstructor
@Slf4j
public class InternalLibraryController {

    private final BorrowService borrowService;

    @PatchMapping("/borrows/{borrowId}/fine-status")
    public ResponseEntity<BorrowResponse> updateFineStatus(
            @PathVariable Long borrowId,
            @Valid @RequestBody FineStatusUpdateRequest request
    ) {
        log.info("HIT - PATCH /internal/library/borrows/{}/fine-status | updateFineStatus | fineId={}, status={}",
                borrowId, request.getFineId(), request.getStatus());
        BorrowResponse response = borrowService.updateFineStatus(borrowId, request);
        log.info("SUCCESS - PATCH /internal/library/borrows/{}/fine-status | updateFineStatus | fineStatus={}",
                borrowId, response.getFineStatus());
        return ResponseEntity.ok(response);
    }
}
