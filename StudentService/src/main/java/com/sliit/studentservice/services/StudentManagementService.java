package com.sliit.studentservice.services;

import com.sliit.studentservice.dtos.filters.StudentFilterDto;
import com.sliit.studentservice.dtos.requests.StudentCreateRequestDto;
import com.sliit.studentservice.dtos.response.StudentCreateResponseDto;
import com.sliit.studentservice.dtos.response.StudentResponseDto;
import org.springframework.http.ResponseEntity;

public interface StudentManagementService {
    ResponseEntity<StudentCreateResponseDto> addStudent(StudentCreateRequestDto requestDto);

    ResponseEntity<StudentResponseDto> getStudentsList(StudentFilterDto filterDto);

    ResponseEntity<?> getStudent(String studentId);

    ResponseEntity<?> enrollCourse(String studentId, String courseId);

    ResponseEntity<?> getEnrollments(String studentId);

    ResponseEntity<?> getEnrolledStudentCount(String courseId);
}
