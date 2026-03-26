package com.sliit.studentservice.dto;

import com.sliit.studentservice.dtos.filters.StudentFilterDto;
import com.sliit.studentservice.dtos.requests.StudentCreateRequestDto;
import com.sliit.studentservice.dtos.response.StudentListItemDto;
import com.sliit.studentservice.entity.StudentEntity;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class EntityAndDtoCoverageTest {

    @Test
    void studentFilterDtoExposesDefaultPagingAndSortingValues() {
        StudentFilterDto dto = new StudentFilterDto();

        assertNull(dto.getSearch());
        assertNull(dto.getDepartment());
        assertNull(dto.getYear());
        assertNull(dto.getSemester());
        assertEquals(0, dto.getPage());
        assertEquals(10, dto.getSize());
        assertEquals("createdAt", dto.getSortBy());
        assertEquals("desc", dto.getSortDir());

        dto.setSearch("alice");
        dto.setDepartment("IT");
        dto.setYear(3);
        dto.setSemester(2);
        dto.setPage(1);
        dto.setSize(25);
        dto.setSortBy("name");
        dto.setSortDir("asc");

        assertEquals("alice", dto.getSearch());
        assertEquals("IT", dto.getDepartment());
        assertEquals(3, dto.getYear());
        assertEquals(2, dto.getSemester());
        assertEquals(1, dto.getPage());
        assertEquals(25, dto.getSize());
        assertEquals("name", dto.getSortBy());
        assertEquals("asc", dto.getSortDir());
    }

    @Test
    void studentCreateRequestDtoStoresAllFields() {
        StudentCreateRequestDto dto = new StudentCreateRequestDto();

        dto.setStudentId("STU001");
        dto.setName("Alice");
        dto.setEmail("alice@sliit.lk");
        dto.setPhone("0771234567");
        dto.setDepartment("IT");
        dto.setYear(3);
        dto.setSemester(1);

        assertEquals("STU001", dto.getStudentId());
        assertEquals("Alice", dto.getName());
        assertEquals("alice@sliit.lk", dto.getEmail());
        assertEquals("0771234567", dto.getPhone());
        assertEquals("IT", dto.getDepartment());
        assertEquals(3, dto.getYear());
        assertEquals(1, dto.getSemester());
    }

    @Test
    void studentListItemDtoBuilderPopulatesFields() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 3, 24, 10, 15);

        StudentListItemDto dto = StudentListItemDto.builder()
                .studentId("STU001")
                .name("Alice")
                .email("alice@sliit.lk")
                .phone("0771234567")
                .department("IT")
                .year(3)
                .semester(1)
                .createdAt(createdAt)
                .build();

        assertEquals("STU001", dto.getStudentId());
        assertEquals("Alice", dto.getName());
        assertEquals("alice@sliit.lk", dto.getEmail());
        assertEquals("0771234567", dto.getPhone());
        assertEquals("IT", dto.getDepartment());
        assertEquals(3, dto.getYear());
        assertEquals(1, dto.getSemester());
        assertEquals(createdAt, dto.getCreatedAt());
    }

    @Test
    void studentEntitySupportsBuilderConstructorsAndSetters() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 3, 24, 11, 30);

        StudentEntity built = StudentEntity.builder()
                .id(10L)
                .studentId("STU001")
                .name("Alice")
                .email("alice@sliit.lk")
                .phone("0771234567")
                .department("IT")
                .year(3)
                .semester(1)
                .createdAt(createdAt)
                .build();

        assertEquals(10L, built.getId());
        assertEquals("STU001", built.getStudentId());
        assertEquals("Alice", built.getName());
        assertEquals("alice@sliit.lk", built.getEmail());
        assertEquals("0771234567", built.getPhone());
        assertEquals("IT", built.getDepartment());
        assertEquals(3, built.getYear());
        assertEquals(1, built.getSemester());
        assertEquals(createdAt, built.getCreatedAt());

        StudentEntity constructed = new StudentEntity();
        constructed.setId(20L);
        constructed.setStudentId("STU002");
        constructed.setName("Bob");
        constructed.setEmail("bob@sliit.lk");
        constructed.setPhone("0712345678");
        constructed.setDepartment("SE");
        constructed.setYear(2);
        constructed.setSemester(2);
        constructed.setCreatedAt(createdAt.plusDays(1));

        assertEquals(20L, constructed.getId());
        assertEquals("STU002", constructed.getStudentId());
        assertEquals("Bob", constructed.getName());
        assertEquals("bob@sliit.lk", constructed.getEmail());
        assertEquals("0712345678", constructed.getPhone());
        assertEquals("SE", constructed.getDepartment());
        assertEquals(2, constructed.getYear());
        assertEquals(2, constructed.getSemester());
        assertEquals(createdAt.plusDays(1), constructed.getCreatedAt());
    }
}
