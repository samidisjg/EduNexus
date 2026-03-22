package com.sliit.studentservice.controllers.internal;

import com.sliit.studentservice.services.StudentManagementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class InternalStudentManagementControllerTest {

    @Mock
    private StudentManagementService studentManagementService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        InternalStudentManagementController controller = new InternalStudentManagementController();
        ReflectionTestUtils.setField(controller, "studentManagementService", studentManagementService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getEnrolledStudentCountDelegatesToService() throws Exception {
        doReturn(ResponseEntity.ok(Map.of("courseId", "C001", "enrolledCount", 3)))
                .when(studentManagementService).getEnrolledStudentCount("C001");

        mockMvc.perform(get("/internal/students/count").queryParam("courseId", "C001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseId").value("C001"))
                .andExpect(jsonPath("$.enrolledCount").value(3));

        verify(studentManagementService).getEnrolledStudentCount("C001");
    }
}
