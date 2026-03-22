package com.example.courseservice.controller;

import com.example.courseservice.dto.AvailabilityResponse;
import com.example.courseservice.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/courses")
@Slf4j
@RequiredArgsConstructor
public class InternalCourseController {

    private final CourseService courseService;

    @GetMapping("/{courseId}/availability")
    public AvailabilityResponse availability(@PathVariable String courseId) {
        log.info("HIT - GET /internal/courses/{}/availability", courseId);
        return courseService.availability(courseId);
    }
}
