package com.example.courseservice.service;

import com.example.courseservice.enums.CourseStatus;
import com.example.courseservice.dto.AvailabilityResponse;
import com.example.courseservice.dto.CourseResponse;
import com.example.courseservice.dto.CourseStatsResponse;
import com.example.courseservice.dto.CreateCourseRequest;
import com.example.courseservice.dto.UpdateCapacityRequest;

import java.util.List;

public interface CourseService {
    CourseResponse create(CreateCourseRequest req);
    List<CourseResponse> list();
    CourseResponse get(String courseId);
    CourseResponse updateCapacity(String courseId, UpdateCapacityRequest req);
    CourseStatsResponse stats(String courseId);
    AvailabilityResponse availability(String courseId);
    CourseResponse updateStatus(String courseId, CourseStatus status);
}
