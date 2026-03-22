package com.example.courseservice.model;

import com.example.courseservice.enums.CourseStatus;
import com.example.courseservice.enums.Faculty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Course {

    @Id
    private String courseId;

    private String name;

    private int capacity;

    private int year;

    private int semester;

    private String lic;

    @Enumerated(EnumType.STRING)
    private Faculty faculty;

    @Enumerated(EnumType.STRING)
    private Faculty faculty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseStatus status;
}
