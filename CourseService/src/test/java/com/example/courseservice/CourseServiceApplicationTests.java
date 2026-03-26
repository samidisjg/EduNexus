package com.example.courseservice;

import com.example.courseservice.client.StudentClient;
import com.example.courseservice.repository.CourseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class  CourseServiceApplicationTests {

    @MockBean
    private CourseRepository courseRepository;

    @MockBean
    private StudentClient studentClient;

    @Test
    void contextLoads() {
    }

}
