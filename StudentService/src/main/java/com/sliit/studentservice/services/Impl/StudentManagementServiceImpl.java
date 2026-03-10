package com.sliit.studentservice.services.Impl;

import com.sliit.studentservice.dtos.filters.StudentFilterDto;
import com.sliit.studentservice.dtos.requests.StudentCreateRequestDto;
import com.sliit.studentservice.dtos.response.StudentCreateResponseDto;
import com.sliit.studentservice.dtos.response.StudentListItemDto;
import com.sliit.studentservice.dtos.response.StudentResponseDto;
import com.sliit.studentservice.entity.EnrollmentEntity;
import com.sliit.studentservice.entity.StudentEntity;
import com.sliit.studentservice.repository.EnrollmentManagementRepository;
import com.sliit.studentservice.repository.StudentManagementRepository;
import com.sliit.studentservice.services.StudentManagementService;
import com.sliit.studentservice.services.internal.CourseServiceClient;
import com.sliit.studentservice.dtos.response.CourseAvailabilityResponseDto;
import com.sliit.studentservice.utils.StudentSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentManagementServiceImpl implements StudentManagementService {

    private final StudentManagementRepository studentRepository;
    private final EnrollmentManagementRepository enrollmentManagementRepository;
    private final CourseServiceClient courseServiceClient;

    @Override
    public ResponseEntity<StudentCreateResponseDto> addStudent(StudentCreateRequestDto requestDto) {

        if (requestDto == null) {
            log.warn("addStudent called with null request body");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(StudentCreateResponseDto.builder()
                            .success(false)
                            .message("Request body is required")
                            .build());
        }

        String studentId = safeTrim(requestDto.getStudentId());
        String email = safeTrim(requestDto.getEmail());
        String name = safeTrim(requestDto.getName());

        log.info("Creating student request received. studentId={}, email={}", studentId, email);

        if (studentId == null || studentId.isBlank()) {
            log.warn("Student creation failed: missing studentId");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(StudentCreateResponseDto.builder()
                            .success(false)
                            .message("studentId is required")
                            .build());
        }

        if (name == null || name.isBlank()) {
            log.warn("Student creation failed: missing name. studentId={}", studentId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(StudentCreateResponseDto.builder()
                            .success(false)
                            .message("name is required")
                            .build());
        }

        if (email == null || email.isBlank()) {
            log.warn("Student creation failed: missing email. studentId={}", studentId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(StudentCreateResponseDto.builder()
                            .success(false)
                            .message("email is required")
                            .build());
        }

        // Duplicate studentId check
        if (studentRepository.existsByStudentId(studentId)) {
            log.warn("Student creation blocked: studentId already exists. studentId={}", studentId);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(StudentCreateResponseDto.builder()
                            .success(false)
                            .message("Student already exists for studentId: " + studentId)
                            .studentId(studentId)
                            .email(email)
                            .build());
        }

        // Duplicate email check
        if (studentRepository.existsByEmail(email)) {
            log.warn("Student creation blocked: email already exists. email={}", email);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(StudentCreateResponseDto.builder()
                            .success(false)
                            .message("Student already exists for email: " + email)
                            .studentId(studentId)
                            .email(email)
                            .build());
        }

        StudentEntity student = StudentEntity.builder()
                .studentId(studentId)
                .name(name)
                .email(email)
                .phone(safeTrim(requestDto.getPhone()))
                .department(safeTrim(requestDto.getDepartment()))
                .year(requestDto.getYear())
                .createdAt(LocalDateTime.now())
                .build();

        StudentEntity saved = studentRepository.save(student);

        log.info("Student created successfully. studentId={}, email={}", saved.getStudentId(), saved.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(StudentCreateResponseDto.builder()
                        .success(true)
                        .message("Student created successfully")
                        .studentId(saved.getStudentId())
                        .name(saved.getName())
                        .email(saved.getEmail())
                        .build());
    }


    @Override
    public ResponseEntity<StudentResponseDto> getStudentsList(StudentFilterDto filterDto) {

        StudentFilterDto f = normalize(filterDto);

        log.info("getStudentsList called. filters={}", f);

        validateFilters(f);

        Sort sort = Sort.by(Sort.Direction.fromString(f.getSortDir()), f.getSortBy());
        Pageable pageable = PageRequest.of(f.getPage(), f.getSize(), sort);

        Page<StudentEntity> page = studentRepository.findAll(StudentSpecifications.byFilters(f), pageable);

        log.info("Students fetched. page={}, size={}, totalElements={}, totalPages={}",
                page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());

        List<StudentListItemDto> students = page.getContent().stream()
                .map(this::toListItem)
                .toList();

        return ResponseEntity.ok(
                StudentResponseDto.builder()
                        .success(true)
                        .message("Students fetched successfully")
                        .students(students)
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .page(page.getNumber())
                        .size(page.getSize())
                        .build()
        );
    }

    private StudentListItemDto toListItem(StudentEntity s) {
        return StudentListItemDto.builder()
                .studentId(s.getStudentId())
                .name(s.getName())
                .email(s.getEmail())
                .phone(s.getPhone())
                .department(s.getDepartment())
                .year(s.getYear())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private void validateFilters(StudentFilterDto f) {
        if (f.getPage() < 0) {
            throw new IllegalArgumentException("page must be 0 or greater");
        }
        if (f.getSize() < 1 || f.getSize() > 100) {
            throw new IllegalArgumentException("size must be between 1 and 100");
        }

        List<String> allowedSortFields = List.of("createdAt", "studentId", "name", "email", "department", "year");
        if (!allowedSortFields.contains(f.getSortBy())) {
            throw new IllegalArgumentException("Invalid sortBy. Allowed: " + allowedSortFields);
        }

        if (!f.getSortDir().equalsIgnoreCase("asc") && !f.getSortDir().equalsIgnoreCase("desc")) {
            throw new IllegalArgumentException("sortDir must be asc or desc");
        }
    }

    private StudentFilterDto normalize(StudentFilterDto f) {
        if (f == null) {
            f = new StudentFilterDto();
        }

        if (f.getSearch() != null) f.setSearch(f.getSearch().trim());
        if (f.getDepartment() != null) f.setDepartment(f.getDepartment().trim());

        if (f.getPage() == null) f.setPage(0);
        if (f.getSize() == null) f.setSize(10);
        if (f.getSortBy() == null || f.getSortBy().trim().isEmpty()) f.setSortBy("createdAt");
        if (f.getSortDir() == null || f.getSortDir().trim().isEmpty()) f.setSortDir("desc");

        return f;
    }

    private String safeTrim(String value) {
        return value == null ? null : value.trim();
    }

    @Override
    public ResponseEntity<?> getStudent(String studentId) {
        log.info("getStudent called. studentId={}", studentId);

        if (studentId == null || studentId.isBlank()) {
            log.warn("getStudent failed: missing studentId");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("studentId is required");
        }

        var student = studentRepository.findByStudentId(studentId);
        if (student.isEmpty()) {
            log.warn("getStudent failed: student not found. studentId={}", studentId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student not found for studentId: " + studentId);
        }

        log.info("Student fetched successfully. studentId={}", studentId);
        return ResponseEntity.ok(toListItem(student.get()));
    }

    @Override
    public ResponseEntity<?> enrollCourse(String studentId, String courseId) {
        log.info("enrollCourse called. studentId={}, courseId={}", studentId, courseId);

        if (studentId == null || studentId.isBlank()) {
            log.warn("enrollCourse failed: missing studentId");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("studentId is required");
        }

        if (courseId == null || courseId.isBlank()) {
            log.warn("enrollCourse failed: missing courseId");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("courseId is required");
        }

        var student = studentRepository.findByStudentId(studentId);
        if (student.isEmpty()) {
            log.warn("enrollCourse failed: student not found. studentId={}", studentId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student not found for studentId: " + studentId);
        }

        if (enrollmentManagementRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            log.warn("enrollCourse blocked: duplicate enrollment. studentId={}, courseId={}", studentId, courseId);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Student is already enrolled for courseId: " + courseId);
        }

        CourseAvailabilityResponseDto availability;
        try {
            availability = courseServiceClient.getCourseAvailability(courseId);
        } catch (IllegalStateException ex) {
            log.error("enrollCourse failed: course availability check failed. courseId={}", courseId, ex);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Course service unavailable. Please try again later.");
        }

        boolean available = Boolean.TRUE.equals(availability.getAvailable());
        int remainingSeats = availability.getRemainingSeats() == null ? 0 : availability.getRemainingSeats();
        if (!available || remainingSeats <= 0) {
            log.warn("enrollCourse blocked: no capacity. studentId={}, courseId={}, remainingSeats={}",
                    studentId, courseId, remainingSeats);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Course is not available or has no remaining seats for courseId: " + courseId);
        }

        EnrollmentEntity savedEnrollment = enrollmentManagementRepository.save(
                EnrollmentEntity.builder()
                        .studentId(studentId)
                        .courseId(courseId)
                        .enrolledAt(LocalDateTime.now())
                        .build()
        );

        log.info("Enrollment created. enrollmentId={}, studentId={}, courseId={}",
                savedEnrollment.getId(), studentId, courseId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Enrollment successful");
    }

    @Override
    public ResponseEntity<?> getEnrollments(String studentId) {
        log.info("getEnrollments called. studentId={}", studentId);

        if (studentId == null || studentId.isBlank()) {
            log.warn("getEnrollments failed: missing studentId");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("studentId is required");
        }

        var student = studentRepository.findByStudentId(studentId);
        if (student.isEmpty()) {
            log.warn("getEnrollments failed: student not found. studentId={}", studentId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student not found for studentId: " + studentId);
        }

        List<EnrollmentEntity> enrollments = enrollmentManagementRepository.findByStudentId(studentId);

        log.info("Enrollments fetched. studentId={}, count={}", studentId, enrollments.size());
        return ResponseEntity.ok(enrollments);
    }

    @Override
    public ResponseEntity<?> getEnrolledStudentCount(String courseId) {
        log.info("getEnrolledStudentCount called. courseId={}", courseId);

        if (courseId == null || courseId.isBlank()) {
            log.warn("getEnrolledStudentCount failed: missing courseId");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("courseId is required");
        }

        long count = studentRepository.countEnrollmentsByCourseId(courseId);
        log.info("Enrolled student count fetched. courseId={}, count={}", courseId, count);

        return ResponseEntity.ok(java.util.Map.of(
                "courseId", courseId,
                "enrolledCount", count
        ));
    }
}
