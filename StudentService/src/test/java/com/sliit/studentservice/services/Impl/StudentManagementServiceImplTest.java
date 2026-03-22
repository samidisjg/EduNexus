package com.sliit.studentservice.services.Impl;

import com.sliit.studentservice.dtos.filters.StudentFilterDto;
import com.sliit.studentservice.dtos.requests.StudentCreateRequestDto;
import com.sliit.studentservice.dtos.response.CourseAvailabilityResponseDto;
import com.sliit.studentservice.dtos.response.StudentCreateResponseDto;
import com.sliit.studentservice.dtos.response.StudentListItemDto;
import com.sliit.studentservice.dtos.response.StudentResponseDto;
import com.sliit.studentservice.entity.EnrollmentEntity;
import com.sliit.studentservice.entity.StudentEntity;
import com.sliit.studentservice.repository.EnrollmentManagementRepository;
import com.sliit.studentservice.repository.StudentManagementRepository;
import com.sliit.studentservice.services.internal.CourseServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentManagementServiceImplTest {

    @Mock
    private StudentManagementRepository studentRepository;

    @Mock
    private EnrollmentManagementRepository enrollmentRepository;

    @Mock
    private CourseServiceClient courseServiceClient;

    @InjectMocks
    private StudentManagementServiceImpl service;

    private StudentCreateRequestDto validCreateRequest;

    @BeforeEach
    void setUp() {
        validCreateRequest = new StudentCreateRequestDto();
        validCreateRequest.setStudentId("STU001");
        validCreateRequest.setName("Alice");
        validCreateRequest.setEmail("alice@sliit.lk");
        validCreateRequest.setPhone("0712345678");
        validCreateRequest.setDepartment("IT");
        validCreateRequest.setYear(3);
    }

    @Test
    void addStudentReturnsBadRequestWhenRequestIsNull() {
        ResponseEntity<StudentCreateResponseDto> response = service.addStudent(null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Request body is required", response.getBody().getMessage());
        assertFalse(response.getBody().isSuccess());
    }

    @Test
    void addStudentReturnsBadRequestWhenStudentIdIsMissing() {
        validCreateRequest.setStudentId("   ");

        ResponseEntity<StudentCreateResponseDto> response = service.addStudent(validCreateRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("studentId is required", response.getBody().getMessage());
    }

    @Test
    void addStudentReturnsBadRequestWhenNameIsMissing() {
        validCreateRequest.setName(" ");

        ResponseEntity<StudentCreateResponseDto> response = service.addStudent(validCreateRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("name is required", response.getBody().getMessage());
    }

    @Test
    void addStudentReturnsBadRequestWhenEmailIsMissing() {
        validCreateRequest.setEmail(" ");

        ResponseEntity<StudentCreateResponseDto> response = service.addStudent(validCreateRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("email is required", response.getBody().getMessage());
    }

    @Test
    void addStudentReturnsConflictWhenStudentIdAlreadyExists() {
        when(studentRepository.existsByStudentId("STU001")).thenReturn(true);

        ResponseEntity<StudentCreateResponseDto> response = service.addStudent(validCreateRequest);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertTrue(response.getBody().getMessage().contains("Student already exists for studentId"));
    }

    @Test
    void addStudentReturnsConflictWhenEmailAlreadyExists() {
        when(studentRepository.existsByStudentId("STU001")).thenReturn(false);
        when(studentRepository.existsByEmail("alice@sliit.lk")).thenReturn(true);

        ResponseEntity<StudentCreateResponseDto> response = service.addStudent(validCreateRequest);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertTrue(response.getBody().getMessage().contains("Student already exists for email"));
    }

    @Test
    void addStudentCreatesStudentWhenInputIsValid() {
        when(studentRepository.existsByStudentId("STU001")).thenReturn(false);
        when(studentRepository.existsByEmail("alice@sliit.lk")).thenReturn(false);
        when(studentRepository.save(any(StudentEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<StudentCreateResponseDto> response = service.addStudent(validCreateRequest);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Student created successfully", response.getBody().getMessage());

        ArgumentCaptor<StudentEntity> captor = ArgumentCaptor.forClass(StudentEntity.class);
        verify(studentRepository).save(captor.capture());
        StudentEntity savedEntity = captor.getValue();
        assertEquals("STU001", savedEntity.getStudentId());
        assertEquals("Alice", savedEntity.getName());
        assertEquals("alice@sliit.lk", savedEntity.getEmail());
        assertNotNull(savedEntity.getCreatedAt());
    }

    @Test
    void getStudentsListReturnsMappedPageData() {
        StudentFilterDto filter = new StudentFilterDto();
        filter.setPage(1);
        filter.setSize(2);
        filter.setSortBy("name");
        filter.setSortDir("asc");

        StudentEntity s1 = StudentEntity.builder().studentId("S1").name("A").email("a@mail.com").build();
        StudentEntity s2 = StudentEntity.builder().studentId("S2").name("B").email("b@mail.com").build();

        Pageable pageable = PageRequest.of(1, 2, Sort.by(Sort.Direction.ASC, "name"));
        when(studentRepository.findAll(
                org.mockito.ArgumentMatchers.<org.springframework.data.jpa.domain.Specification<StudentEntity>>any(),
                any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(s1, s2), pageable, 5));

        ResponseEntity<StudentResponseDto> response = service.getStudentsList(filter);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getStudents().size());
        assertEquals(5, response.getBody().getTotalElements());
        assertEquals(1, response.getBody().getPage());
        assertEquals(2, response.getBody().getSize());
    }

    @Test
    void getStudentsListUsesDefaultFilterWhenFilterIsNull() {
        when(studentRepository.findAll(
                org.mockito.ArgumentMatchers.<org.springframework.data.jpa.domain.Specification<StudentEntity>>any(),
                any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        service.getStudentsList(null);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(studentRepository).findAll(
                org.mockito.ArgumentMatchers.<org.springframework.data.jpa.domain.Specification<StudentEntity>>any(),
                pageableCaptor.capture());

        Pageable pageable = pageableCaptor.getValue();
        assertEquals(0, pageable.getPageNumber());
        assertEquals(10, pageable.getPageSize());
        assertEquals(Sort.Direction.DESC, pageable.getSort().getOrderFor("createdAt").getDirection());
    }

    @Test
    void getStudentsListThrowsWhenPageIsNegative() {
        StudentFilterDto filter = new StudentFilterDto();
        filter.setPage(-1);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.getStudentsList(filter));

        assertEquals("page must be 0 or greater", ex.getMessage());
    }

    @Test
    void getStudentsListThrowsWhenSizeOutOfRange() {
        StudentFilterDto filter = new StudentFilterDto();
        filter.setSize(101);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.getStudentsList(filter));

        assertEquals("size must be between 1 and 100", ex.getMessage());
    }

    @Test
    void getStudentsListThrowsWhenSortByInvalid() {
        StudentFilterDto filter = new StudentFilterDto();
        filter.setSortBy("unknown");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.getStudentsList(filter));

        assertTrue(ex.getMessage().contains("Invalid sortBy"));
    }

    @Test
    void getStudentsListThrowsWhenSortDirInvalid() {
        StudentFilterDto filter = new StudentFilterDto();
        filter.setSortDir("up");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.getStudentsList(filter));

        assertEquals("sortDir must be asc or desc", ex.getMessage());
    }

    @Test
    void getStudentReturnsBadRequestWhenStudentIdMissing() {
        ResponseEntity<?> response = service.getStudent(" ");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("studentId is required", response.getBody());
    }

    @Test
    void getStudentReturnsNotFoundWhenStudentMissing() {
        when(studentRepository.findByStudentId("STU404")).thenReturn(Optional.empty());

        ResponseEntity<?> response = service.getStudent("STU404");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Student not found for studentId: STU404", response.getBody());
    }

    @Test
    void getStudentReturnsStudentWhenFound() {
        StudentEntity entity = StudentEntity.builder()
                .studentId("STU001")
                .name("Alice")
                .email("alice@sliit.lk")
                .build();
        when(studentRepository.findByStudentId("STU001")).thenReturn(Optional.of(entity));

        ResponseEntity<?> response = service.getStudent("STU001");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof StudentListItemDto);
        StudentListItemDto dto = (StudentListItemDto) response.getBody();
        assertEquals("STU001", dto.getStudentId());
    }

    @Test
    void enrollCourseReturnsBadRequestWhenStudentIdMissing() {
        ResponseEntity<?> response = service.enrollCourse(" ", "C001");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("studentId is required", response.getBody());
    }

    @Test
    void enrollCourseReturnsBadRequestWhenCourseIdMissing() {
        ResponseEntity<?> response = service.enrollCourse("STU001", " ");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("courseId is required", response.getBody());
    }

    @Test
    void enrollCourseReturnsNotFoundWhenStudentMissing() {
        when(studentRepository.findByStudentId("STU001")).thenReturn(Optional.empty());

        ResponseEntity<?> response = service.enrollCourse("STU001", "C001");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void enrollCourseReturnsConflictWhenAlreadyEnrolled() {
        when(studentRepository.findByStudentId("STU001")).thenReturn(Optional.of(StudentEntity.builder().build()));
        when(enrollmentRepository.existsByStudentIdAndCourseId("STU001", "C001")).thenReturn(true);

        ResponseEntity<?> response = service.enrollCourse("STU001", "C001");

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    void enrollCourseReturnsServiceUnavailableWhenCourseServiceFails() {
        when(studentRepository.findByStudentId("STU001")).thenReturn(Optional.of(StudentEntity.builder().build()));
        when(enrollmentRepository.existsByStudentIdAndCourseId("STU001", "C001")).thenReturn(false);
        when(courseServiceClient.getCourseAvailability("C001"))
                .thenThrow(new IllegalStateException("down"));

        ResponseEntity<?> response = service.enrollCourse("STU001", "C001");

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("Course service unavailable. Please try again later.", response.getBody());
    }

    @Test
    void enrollCourseReturnsConflictWhenCourseIsNotAvailable() {
        when(studentRepository.findByStudentId("STU001")).thenReturn(Optional.of(StudentEntity.builder().build()));
        when(enrollmentRepository.existsByStudentIdAndCourseId("STU001", "C001")).thenReturn(false);
        when(courseServiceClient.getCourseAvailability("C001"))
                .thenReturn(CourseAvailabilityResponseDto.builder().available(false).remainingSeats(5).build());

        ResponseEntity<?> response = service.enrollCourse("STU001", "C001");

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    void enrollCourseReturnsConflictWhenNoRemainingSeats() {
        when(studentRepository.findByStudentId("STU001")).thenReturn(Optional.of(StudentEntity.builder().build()));
        when(enrollmentRepository.existsByStudentIdAndCourseId("STU001", "C001")).thenReturn(false);
        when(courseServiceClient.getCourseAvailability("C001"))
                .thenReturn(CourseAvailabilityResponseDto.builder().available(true).remainingSeats(0).build());

        ResponseEntity<?> response = service.enrollCourse("STU001", "C001");

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    void enrollCourseCreatesEnrollmentWhenCourseHasCapacity() {
        when(studentRepository.findByStudentId("STU001")).thenReturn(Optional.of(StudentEntity.builder().build()));
        when(enrollmentRepository.existsByStudentIdAndCourseId("STU001", "C001")).thenReturn(false);
        when(courseServiceClient.getCourseAvailability("C001"))
                .thenReturn(CourseAvailabilityResponseDto.builder().available(true).remainingSeats(4).build());
        when(enrollmentRepository.save(any(EnrollmentEntity.class)))
                .thenAnswer(invocation -> {
                    EnrollmentEntity entity = invocation.getArgument(0);
                    entity.setId(10L);
                    return entity;
                });

        ResponseEntity<?> response = service.enrollCourse("STU001", "C001");

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Enrollment successful", response.getBody());
        verify(enrollmentRepository).save(any(EnrollmentEntity.class));
    }

    @Test
    void getEnrollmentsReturnsBadRequestWhenStudentIdMissing() {
        ResponseEntity<?> response = service.getEnrollments(" ");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getEnrollmentsReturnsNotFoundWhenStudentMissing() {
        when(studentRepository.findByStudentId("STU001")).thenReturn(Optional.empty());

        ResponseEntity<?> response = service.getEnrollments("STU001");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getEnrollmentsReturnsEnrollmentListWhenStudentExists() {
        when(studentRepository.findByStudentId("STU001")).thenReturn(Optional.of(StudentEntity.builder().build()));
        when(enrollmentRepository.findByStudentId("STU001"))
                .thenReturn(List.of(EnrollmentEntity.builder().id(1L).courseId("C001").enrolledAt(LocalDateTime.now()).build()));

        ResponseEntity<?> response = service.getEnrollments("STU001");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List<?>);
        assertEquals(1, ((List<?>) response.getBody()).size());
    }

    @Test
    void getEnrolledStudentCountReturnsBadRequestWhenCourseIdMissing() {
        ResponseEntity<?> response = service.getEnrolledStudentCount(" ");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("courseId is required", response.getBody());
    }

    @Test
    void getEnrolledStudentCountReturnsCount() {
        when(studentRepository.countEnrollmentsByCourseId("C001")).thenReturn(7L);

        ResponseEntity<?> response = service.getEnrolledStudentCount("C001");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map<?, ?>);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("C001", body.get("courseId"));
        assertEquals(7L, body.get("enrolledCount"));
    }
}

