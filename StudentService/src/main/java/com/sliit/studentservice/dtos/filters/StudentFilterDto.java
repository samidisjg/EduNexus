package com.sliit.studentservice.dtos.filters;

import lombok.Data;

@Data
public class StudentFilterDto {

    private String search;
    private String department;
    private Integer year;

    private Integer page = 0;
    private Integer size = 10;

    private String sortBy = "createdAt";
    private String sortDir = "desc";
}
