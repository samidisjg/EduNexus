package com.example.courseservice.service;

import com.example.courseservice.client.StudentClient;
import com.example.courseservice.dto.AvailabilityResponse;
import com.example.courseservice.dto.CourseResponse;
import com.example.courseservice.dto.CourseStatsResponse;
import com.example.courseservice.dto.CreateCourseRequest;
import com.example.courseservice.dto.UpdateCapacityRequest;
import com.example.courseservice.enums.CourseStatus;
import com.example.courseservice.enums.Faculty;
import com.example.courseservice.exception.ApiException;
import com.example.courseservice.model.Course;
import com.example.courseservice.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseServiceImplTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private StudentClient studentClient;

    @InjectMocks
    private CourseServiceImpl courseService;

    private Course course;

    @BeforeEach
    void setUp() {
        course = Course.builder()
                .courseId("CS101")
                .name("Programming Fundamentals")
                .capacity(50)
                .year(1)
                .semester(1)
                .lic("Dr. Smith")
                .faculty(Faculty.FOC)
                .status(CourseStatus.ACTIVE)
                .build();
    }

    @Test
    void createShouldPersistCourseWhenIdDoesNotExist() {
        CreateCourseRequest request = new CreateCourseRequest();
        request.setCourseId("CS102");
        request.setName("OOP");
        request.setCapacity(60);
        request.setYear(2);
        request.setSemester(1);
        request.setLic("Prof. Jane");
        request.setFaculty(Faculty.FOC);

        when(courseRepository.existsById("CS102")).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CourseResponse response = courseService.create(request);

        assertEquals("CS102", response.getCourseId());
        assertEquals(CourseStatus.ACTIVE, response.getStatus());
        verify(courseRepository).save(any(Course.class));
    }

    @Test
    void createShouldThrowConflictWhenCourseAlreadyExists() {
        CreateCourseRequest request = new CreateCourseRequest();
        request.setCourseId("CS101");

        when(courseRepository.existsById("CS101")).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () -> courseService.create(request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertTrue(ex.getMessage().contains("Course already exists"));
    }

    @Test
    void listShouldReturnAllCourses() {
        when(courseRepository.findAll()).thenReturn(List.of(course));

        List<CourseResponse> response = courseService.list();

        assertEquals(1, response.size());
        assertEquals("CS101", response.get(0).getCourseId());
    }

    @Test
    void getShouldReturnCourseWhenFound() {
        when(courseRepository.findById("CS101")).thenReturn(Optional.of(course));

        CourseResponse response = courseService.get("CS101");

        assertEquals("Programming Fundamentals", response.getName());
    }

    @Test
    void getShouldThrowNotFoundWhenCourseDoesNotExist() {
        when(courseRepository.findById("CS404")).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> courseService.get("CS404"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void updateCapacityShouldUpdateAndReturnCourse() {
        UpdateCapacityRequest request = new UpdateCapacityRequest();
        request.setCapacity(80);
        when(courseRepository.findById("CS101")).thenReturn(Optional.of(course));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CourseResponse response = courseService.updateCapacity("CS101", request);

        assertEquals(80, response.getCapacity());
        verify(courseRepository).save(course);
    }

    @Test
    void updateCapacityShouldThrowNotFoundWhenCourseDoesNotExist() {
        UpdateCapacityRequest request = new UpdateCapacityRequest();
        request.setCapacity(40);
        when(courseRepository.findById("CS404")).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> courseService.updateCapacity("CS404", request));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void statsShouldReturnEnrollmentAndRemainingWhenStudentServiceResponds() {
        when(courseRepository.findById("CS101")).thenReturn(Optional.of(course));
        when(studentClient.getEnrolledCount("CS101")).thenReturn(20);

        CourseStatsResponse response = courseService.stats("CS101");

        assertEquals(50, response.getCapacity());
        assertEquals(20, response.getEnrolled());
        assertEquals(30, response.getRemaining());
    }

    @Test
    void statsShouldClampRemainingToZeroWhenEnrolledExceedsCapacity() {
        when(courseRepository.findById("CS101")).thenReturn(Optional.of(course));
        when(studentClient.getEnrolledCount("CS101")).thenReturn(100);

        CourseStatsResponse response = courseService.stats("CS101");

        assertEquals(0, response.getRemaining());
    }

    @Test
    void statsShouldThrowNotFoundWhenCourseDoesNotExist() {
        when(courseRepository.findById("CS404")).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> courseService.stats("CS404"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void statsShouldThrowServiceUnavailableWhenStudentServiceFails() {
        when(courseRepository.findById("CS101")).thenReturn(Optional.of(course));
        when(studentClient.getEnrolledCount("CS101")).thenThrow(new RuntimeException("connection error"));

        ApiException ex = assertThrows(ApiException.class, () -> courseService.stats("CS101"));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatus());
    }

    @Test
    void availabilityShouldReturnTrueWhenActiveCourseHasSeats() {
        when(courseRepository.findById("CS101")).thenReturn(Optional.of(course));
        when(studentClient.getEnrolledCount("CS101")).thenReturn(45);

        AvailabilityResponse response = courseService.availability("CS101");

        assertTrue(response.isAvailable());
        assertEquals(5, response.getRemainingSeats());
    }

    @Test
    void availabilityShouldReturnFalseWhenNoRemainingSeats() {
        when(courseRepository.findById("CS101")).thenReturn(Optional.of(course));
        when(studentClient.getEnrolledCount("CS101")).thenReturn(50);

        AvailabilityResponse response = courseService.availability("CS101");

        assertFalse(response.isAvailable());
        assertEquals(0, response.getRemainingSeats());
    }

    @Test
    void availabilityShouldThrowNotFoundWhenCourseDoesNotExist() {
        when(courseRepository.findById("CS404")).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> courseService.availability("CS404"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void availabilityShouldReturnFalseForInactiveCourseWithoutCallingStudentService() {
        course.setStatus(CourseStatus.INACTIVE);
        when(courseRepository.findById("CS101")).thenReturn(Optional.of(course));

        AvailabilityResponse response = courseService.availability("CS101");

        assertFalse(response.isAvailable());
        assertEquals(0, response.getRemainingSeats());
        verify(studentClient, never()).getEnrolledCount(any());
    }

    @Test
    void updateStatusShouldUpdateCourseStatus() {
        when(courseRepository.findById("CS101")).thenReturn(Optional.of(course));

        CourseResponse response = courseService.updateStatus("CS101", CourseStatus.INACTIVE);

        assertEquals(CourseStatus.INACTIVE, response.getStatus());
    }

    @Test
    void updateStatusShouldThrowNotFoundWhenCourseDoesNotExist() {
        when(courseRepository.findById("CS404")).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> courseService.updateStatus("CS404", CourseStatus.ACTIVE));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }
}
