package com.example.courseservice.controller;

import com.example.courseservice.dto.AvailabilityResponse;
import com.example.courseservice.dto.CourseResponse;
import com.example.courseservice.dto.CourseStatsResponse;
import com.example.courseservice.enums.CourseStatus;
import com.example.courseservice.enums.Faculty;
import com.example.courseservice.exception.ApiException;
import com.example.courseservice.exception.GlobalExceptionHandler;
import com.example.courseservice.service.CourseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {CourseController.class, InternalCourseController.class})
@Import(GlobalExceptionHandler.class)
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseService courseService;

    @Test
    void createShouldReturnCreatedForValidRequest() throws Exception {
        CourseResponse response = CourseResponse.builder()
                .courseId("CS101")
                .name("Programming")
                .capacity(50)
                .year(1)
                .semester(1)
                .lic("Dr. X")
                .faculty(Faculty.FOC)
                .status(CourseStatus.ACTIVE)
                .build();

        when(courseService.create(any())).thenReturn(response);

        mockMvc.perform(post("/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "courseId": "CS101",
                                  "name": "Programming",
                                  "capacity": 50,
                                  "year": 1,
                                  "semester": 1,
                                  "lic": "Dr. X",
                                  "faculty": "FOC"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.courseId").value("CS101"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void createShouldReturnBadRequestForValidationFailure() throws Exception {
        mockMvc.perform(post("/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "courseId": "",
                                  "name": "",
                                  "capacity": -1,
                                  "year": 0,
                                  "semester": 4,
                                  "lic": "",
                                  "faculty": null
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listShouldReturnAllCourses() throws Exception {
        CourseResponse response = CourseResponse.builder()
                .courseId("CS101")
                .name("Programming")
                .capacity(50)
                .year(1)
                .semester(1)
                .lic("Dr. X")
                .faculty(Faculty.FOC)
                .status(CourseStatus.ACTIVE)
                .build();

        when(courseService.list()).thenReturn(List.of(response));

        mockMvc.perform(get("/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseId").value("CS101"));
    }

    @Test
    void getShouldMapApiExceptionUsingGlobalHandler() throws Exception {
        when(courseService.get("CS404"))
                .thenThrow(new ApiException(HttpStatus.NOT_FOUND, "Course not found: CS404"));

        mockMvc.perform(get("/courses/CS404"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Course not found: CS404"))
                .andExpect(jsonPath("$.path").value("/courses/CS404"));
    }

    @Test
    void updateCapacityShouldReturnBadRequestForNegativeValue() throws Exception {
        mockMvc.perform(patch("/courses/CS101/capacity")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "capacity": -5
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void statsShouldReturnCourseStats() throws Exception {
        CourseStatsResponse stats = CourseStatsResponse.builder()
                .courseId("CS101")
                .capacity(50)
                .enrolled(30)
                .remaining(20)
                .status(CourseStatus.ACTIVE)
                .build();

        when(courseService.stats("CS101")).thenReturn(stats);

        mockMvc.perform(get("/courses/CS101/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.remaining").value(20));
    }

    @Test
    void updateStatusShouldAcceptValidEnumParam() throws Exception {
        CourseResponse response = CourseResponse.builder()
                .courseId("CS101")
                .name("Programming")
                .capacity(50)
                .year(1)
                .semester(1)
                .lic("Dr. X")
                .faculty(Faculty.FOC)
                .status(CourseStatus.INACTIVE)
                .build();

        when(courseService.updateStatus(eq("CS101"), eq(CourseStatus.INACTIVE))).thenReturn(response);

        mockMvc.perform(patch("/courses/CS101/status?status=INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }

    @Test
    void updateStatusShouldRejectInvalidEnumParam() throws Exception {
        mockMvc.perform(patch("/courses/CS101/status?status=UNKNOWN"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void publicAvailabilityShouldReturnAvailability() throws Exception {
        AvailabilityResponse response = AvailabilityResponse.builder()
                .courseId("CS101")
                .available(false)
                .remainingSeats(0)
                .build();

        when(courseService.availability("CS101")).thenReturn(response);

        mockMvc.perform(get("/courses/CS101/availability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false))
                .andExpect(jsonPath("$.remainingSeats").value(0));
    }

    @Test
    void internalAvailabilityShouldReturnAvailability() throws Exception {
        AvailabilityResponse response = AvailabilityResponse.builder()
                .courseId("CS101")
                .available(true)
                .remainingSeats(12)
                .build();

        when(courseService.availability("CS101")).thenReturn(response);

        mockMvc.perform(get("/internal/courses/CS101/availability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.remainingSeats").value(12));
    }
}
