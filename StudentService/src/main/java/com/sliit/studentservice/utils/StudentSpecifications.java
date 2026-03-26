package com.sliit.studentservice.utils;

import com.sliit.studentservice.dtos.filters.StudentFilterDto;
import com.sliit.studentservice.entity.StudentEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class StudentSpecifications {

    public static Specification<StudentEntity> byFilters(StudentFilterDto filterDto) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (filterDto.getSearch() != null && !filterDto.getSearch().isEmpty()) {
                String searchPattern = "%" + filterDto.getSearch().toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), searchPattern);
                Predicate emailPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")), searchPattern);
                Predicate studentIdPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("studentId")), searchPattern);

                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.or(namePredicate, emailPredicate, studentIdPredicate));
            }

            if (filterDto.getDepartment() != null && !filterDto.getDepartment().isEmpty()) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("department"), filterDto.getDepartment()));
            }

            if (filterDto.getYear() != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("year"), filterDto.getYear()));
            }

            if (filterDto.getSemester() != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("semester"), filterDto.getSemester()));
            }

            return predicate;
        };
    }
}
