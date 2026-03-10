package com.sliit.studentservice.dtos.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StudentResponseDto {

    private boolean success;
    private String message;

    private List<StudentListItemDto> students;

    private long totalElements;
    private int totalPages;
    private int page;
    private int size;
}
