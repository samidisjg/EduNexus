package com.sliit.studentservice.controllers;

import com.sliit.studentservice.dtos.response.StudentCreateResponseDto;
import com.sliit.studentservice.dtos.response.StudentResponseDto;
import com.sliit.studentservice.services.StudentManagementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class StudentManagementControllerTest {

    @Mock
    private StudentManagementService studentManagementService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        StudentManagementController controller = new StudentManagementController();
        ReflectionTestUtils.setField(controller, "studentManagementService", studentManagementService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void addStudentDelegatesToService() throws Exception {
        StudentCreateResponseDto response = StudentCreateResponseDto.builder()
                .success(true)
                .message("Student created successfully")
                .studentId("STU001")
                .build();

        when(studentManagementService.addStudent(any())).thenReturn(ResponseEntity.status(201).body(response));

        mockMvc.perform(post("/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"studentId\":\"STU001\",\"name\":\"Alice\",\"email\":\"alice@sliit.lk\",\"year\":3,\"semester\":1}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.studentId").value("STU001"));

        verify(studentManagementService).addStudent(any());
    }

    @Test
    void getStudentsListDelegatesToServiceWithQueryParams() throws Exception {
        StudentResponseDto response = StudentResponseDto.builder()
                .success(true)
                .message("Students fetched successfully")
                .totalElements(0)
                .totalPages(0)
                .page(0)
                .size(10)
                .build();

        when(studentManagementService.getStudentsList(any())).thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get("/students")
                        .queryParam("search", "alice")
                        .queryParam("department", "IT")
                        .queryParam("page", "0")
                        .queryParam("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(studentManagementService).getStudentsList(any());
    }

    @Test
    void getStudentDelegatesToService() throws Exception {
        ResponseEntity<?> serviceResponse = ResponseEntity.ok(Map.of("studentId", "STU001"));
        doReturn(serviceResponse).when(studentManagementService).getStudent("STU001");

        mockMvc.perform(get("/students/STU001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value("STU001"));

        verify(studentManagementService).getStudent("STU001");
    }

    @Test
    void enrollCourseDelegatesToService() throws Exception {
        ResponseEntity<?> serviceResponse = ResponseEntity.status(HttpStatus.CREATED).body("Enrollment successful");
        doReturn(serviceResponse).when(studentManagementService).enrollCourse("STU001", "C001");

        mockMvc.perform(post("/students/STU001/enroll").queryParam("courseId", "C001"))
                .andExpect(status().isCreated());

        verify(studentManagementService).enrollCourse("STU001", "C001");
    }

    @Test
    void enrollCourseFailsWhenCourseIdMissing() throws Exception {
        mockMvc.perform(post("/students/STU001/enroll"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getEnrollmentsDelegatesToService() throws Exception {
        when(studentManagementService.getEnrollments("STU001")).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(get("/students/STU001/enrollments"))
                .andExpect(status().isOk());

        verify(studentManagementService).getEnrollments("STU001");
    }

    @Test
    void getEnrolledStudentCountDelegatesToService() throws Exception {
        ResponseEntity<?> serviceResponse = ResponseEntity.ok(Map.of("courseId", "C001", "enrolledCount", 2));
        doReturn(serviceResponse).when(studentManagementService).getEnrolledStudentCount("C001");

        mockMvc.perform(get("/students/internal/students/count").queryParam("courseId", "C001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enrolledCount").value(2));

        verify(studentManagementService, times(1)).getEnrolledStudentCount("C001");
    }
}
