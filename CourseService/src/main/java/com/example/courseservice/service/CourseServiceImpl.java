package com.example.courseservice.service;

import com.example.courseservice.model.Course;
import com.example.courseservice.repository.CourseRepository;
import com.example.courseservice.enums.CourseStatus;
import com.example.courseservice.client.StudentClient;
import com.example.courseservice.dto.*;
import com.example.courseservice.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final StudentClient studentClient;


    @Transactional
    @Override
    public CourseResponse create(CreateCourseRequest req) {
        String courseId = req.getCourseId();

        if (courseRepository.existsById(courseId)) {
            log.warn("Create rejected. Course already exists: {}", courseId);
            throw new ApiException(HttpStatus.CONFLICT, "Course already exists: " + courseId);
        }

        Course course = Course.builder()
                .courseId(req.getCourseId())
                .name(req.getName())
                .capacity(req.getCapacity())
                .status(CourseStatus.ACTIVE)
                .build();

        courseRepository.save(course);

        log.info("Course created: {}", courseId);
        return toResponse(course);
    }

    @Override
    public List<CourseResponse> list() {
        log.debug("Listing courses");
        return courseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public CourseResponse get(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.warn("Course not found: {}", courseId);
                    return new ApiException(HttpStatus.NOT_FOUND, "Course not found: " + courseId);
                });

        return toResponse(course);
    }

    @Transactional
    @Override
    public CourseResponse updateCapacity(String courseId, UpdateCapacityRequest req) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.warn("Course not found for capacity update: {}", courseId);
                    return new ApiException(HttpStatus.NOT_FOUND, "Course not found: " + courseId);
                });

        course.setCapacity(req.getCapacity());
        courseRepository.save(course);

        log.info("Capacity updated. Course: {}, New capacity: {}", courseId, req.getCapacity());
        return toResponse(course);
    }

    @Override
    public CourseStatsResponse stats(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.warn("Course not found for stats: {}", courseId);
                    return new ApiException(HttpStatus.NOT_FOUND, "Course not found: " + courseId);
                });

        int enrolled;
        try {
            log.info("Calling Student Service: enrolled count for course {}", courseId);
            Integer count = studentClient.getEnrolledCount(courseId);
            //Integer count = 30; // TODO : REMOVE THIS WHEN DOING INTEGRATION
            enrolled = safeInt(count);
        } catch (Exception e) {
            log.error("Student service unavailable for enrolled count. courseId={}", courseId, e);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Student service unavailable");
        }

        int remaining = Math.max(course.getCapacity() - enrolled, 0);

        return CourseStatsResponse.builder()
                .courseId(courseId)
                .capacity(course.getCapacity())
                .enrolled(enrolled)
                .remaining(remaining)
                .status(course.getStatus())
                .build();
    }

    @Override
    public AvailabilityResponse availability(String courseId) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Course not found: " + courseId));

        if (course.getStatus() == CourseStatus.INACTIVE) {
            return AvailabilityResponse.builder()
                    .courseId(courseId)
                    .available(false)
                    .remainingSeats(0)
                    .build();
        }

        CourseStatsResponse stats = stats(courseId);

        return AvailabilityResponse.builder()
                .courseId(courseId)
                .available(stats.getRemaining() > 0)
                .remainingSeats(stats.getRemaining())
                .build();
    }

    @Transactional
    @Override
    public CourseResponse updateStatus(String courseId, CourseStatus status) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Course not found: " + courseId));

        course.setStatus(status);

        log.info("Course {} status updated to {}", courseId, status);

        return toResponse(course);
    }

    private CourseResponse toResponse(Course c) {
        return CourseResponse.builder()
                .courseId(c.getCourseId())
                .name(c.getName())
                .capacity(c.getCapacity())
                .status(c.getStatus())
                .build();
    }

    private int safeInt(Integer n) {
        return n == null ? 0 : n;
    }
}