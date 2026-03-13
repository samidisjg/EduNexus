package com.sliit.studentservice.controllers.internal;

import com.sliit.studentservice.services.StudentManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController("/internal")
@RequiredArgsConstructor
@Slf4j
public class InternalStudentManagementController {

    @Autowired
    private StudentManagementService studentManagementService;

    @GetMapping("/internal/students/count")
    public ResponseEntity<?> getEnrolledStudentCount(@RequestParam String courseId) {
        log.info("HIT - GET /internal/students/count | getEnrolledStudentCount | courseId : {}", courseId);
        return studentManagementService.getEnrolledStudentCount(courseId);
    }
}
