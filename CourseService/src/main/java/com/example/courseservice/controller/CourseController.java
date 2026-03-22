package com.example.courseservice.controller;

import com.example.courseservice.enums.CourseStatus;
import com.example.courseservice.service.CourseService;
import com.example.courseservice.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@Slf4j
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseResponse create(@Valid @RequestBody CreateCourseRequest req) {

        log.info("HIT - POST /courses");
        return courseService.create(req);
    }

    @GetMapping
    public List<CourseResponse> list() {
        log.info("HIT - GET /courses");
        return courseService.list();
    }

    @GetMapping("/{courseId}")
    public CourseResponse get(@PathVariable String courseId) {
        log.info("HIT - GET /courses/{}", courseId);
        return courseService.get(courseId);
    }

    @PatchMapping("/{courseId}/capacity")
    public CourseResponse updateCapacity(@PathVariable String courseId,
                                         @Valid @RequestBody UpdateCapacityRequest req) {
        log.info("HIT - PATCH /courses/{}/capacity", courseId);
        return courseService.updateCapacity(courseId, req);
    }

    @GetMapping("/{courseId}/stats")
    public CourseStatsResponse stats(@PathVariable String courseId) {
        log.info("HIT - GET /courses/{}/stats", courseId);
        return courseService.stats(courseId);
    }

    @GetMapping("/{courseId}/availability")
    public AvailabilityResponse availability(@PathVariable String courseId) {
        log.info("HIT - GET /internal/courses/{}/availability", courseId);
        return courseService.availability(courseId);
    }

    @PatchMapping("/{courseId}/status")
    public CourseResponse updateStatus(@PathVariable String courseId,
                                       @RequestParam CourseStatus status) {
        log.info("HIT - PATCH /courses/{}/status", courseId);
        return courseService.updateStatus(courseId, status);
    }
}