package com.sliit.studentservice.controllers;

import com.sliit.studentservice.dtos.filters.StudentFilterDto;
import com.sliit.studentservice.dtos.requests.StudentCreateRequestDto;
import com.sliit.studentservice.dtos.response.StudentCreateResponseDto;
import com.sliit.studentservice.dtos.response.StudentResponseDto;
import com.sliit.studentservice.services.StudentManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@Slf4j
public class StudentManagementController {

    @Autowired
    private StudentManagementService studentManagementService;

    @PostMapping()
    public ResponseEntity<StudentCreateResponseDto> addStudent(@RequestBody StudentCreateRequestDto requestDto) {
        log.info("HIT - POST /students | addStudent | request : {}", requestDto);
        return studentManagementService.addStudent(requestDto);
    }

    @GetMapping()
    public ResponseEntity<StudentResponseDto> getStudentsList(@ModelAttribute StudentFilterDto filterDto) {
        log.info("HIT - GET /students | getStudentsList | filters : {}", filterDto);
        return studentManagementService.getStudentsList(filterDto);
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<?> getStudent(@PathVariable String studentId) {
        log.info("HIT - GET /students/{} | getStudent", studentId);
        return studentManagementService.getStudent(studentId);
    }

    @PostMapping("/{studentId}/enroll")
    public ResponseEntity<?> enrollCourse(@PathVariable String studentId, @RequestParam String courseId) {
        log.info("HIT - POST /students/{}/enroll | enrollCourse | courseId : {}", studentId, courseId);
        return studentManagementService.enrollCourse(studentId, courseId);
    }

    @GetMapping("/{studentId}/enrollments")
    public ResponseEntity<?> getEnrollments(@PathVariable String studentId) {
        log.info("HIT - GET /students/{}/enrollments | getEnrollments", studentId);
        return studentManagementService.getEnrollments(studentId);
    }

    @GetMapping("/internal/students/count")
    public ResponseEntity<?> getEnrolledStudentCount(@RequestParam String courseId) {
        log.info("HIT - GET /internal/students/count | getEnrolledStudentCount | courseId : {}", courseId);
        return studentManagementService.getEnrolledStudentCount(courseId);
    }
}
