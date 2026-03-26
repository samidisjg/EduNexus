package com.sliit.studentservice.utils;

import com.sliit.studentservice.dtos.filters.StudentFilterDto;
import com.sliit.studentservice.entity.StudentEntity;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.*;

class StudentSpecificationsTest {

    @SuppressWarnings("unchecked")
    private static Path<String> stringPath() {
        return mock(Path.class);
    }

    @Test
    void byFiltersReturnsBaseConjunctionWhenNoFiltersProvided() {
        StudentFilterDto filterDto = new StudentFilterDto();
        Specification<StudentEntity> specification = StudentSpecifications.byFilters(filterDto);

        Root<StudentEntity> root = mock(Root.class);
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        CriteriaBuilder criteriaBuilder = mock(CriteriaBuilder.class);
        Predicate conjunction = mock(Predicate.class);

        when(criteriaBuilder.conjunction()).thenReturn(conjunction);

        Predicate result = specification.toPredicate(root, query, criteriaBuilder);

        assertSame(conjunction, result);
        verify(criteriaBuilder).conjunction();
        verifyNoMoreInteractions(criteriaBuilder);
        verifyNoInteractions(root, query);
    }

    @Test
    void byFiltersAddsSearchPredicatesAcrossNameEmailAndStudentId() {
        StudentFilterDto filterDto = new StudentFilterDto();
        filterDto.setSearch("Alice");

        Specification<StudentEntity> specification = StudentSpecifications.byFilters(filterDto);

        Root<StudentEntity> root = mock(Root.class);
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        CriteriaBuilder criteriaBuilder = mock(CriteriaBuilder.class);
        Path<String> namePath = stringPath();
        Path<String> emailPath = stringPath();
        Path<String> studentIdPath = stringPath();
        Expression<String> loweredName = mock(Expression.class);
        Expression<String> loweredEmail = mock(Expression.class);
        Expression<String> loweredStudentId = mock(Expression.class);
        Predicate conjunction = mock(Predicate.class);
        Predicate namePredicate = mock(Predicate.class);
        Predicate emailPredicate = mock(Predicate.class);
        Predicate studentIdPredicate = mock(Predicate.class);
        Predicate orPredicate = mock(Predicate.class);
        Predicate finalPredicate = mock(Predicate.class);

        when(criteriaBuilder.conjunction()).thenReturn(conjunction);
        doReturn(namePath).when(root).get("name");
        doReturn(emailPath).when(root).get("email");
        doReturn(studentIdPath).when(root).get("studentId");
        when(criteriaBuilder.lower(namePath)).thenReturn(loweredName);
        when(criteriaBuilder.lower(emailPath)).thenReturn(loweredEmail);
        when(criteriaBuilder.lower(studentIdPath)).thenReturn(loweredStudentId);
        when(criteriaBuilder.like(loweredName, "%alice%")).thenReturn(namePredicate);
        when(criteriaBuilder.like(loweredEmail, "%alice%")).thenReturn(emailPredicate);
        when(criteriaBuilder.like(loweredStudentId, "%alice%")).thenReturn(studentIdPredicate);
        when(criteriaBuilder.or(namePredicate, emailPredicate, studentIdPredicate)).thenReturn(orPredicate);
        when(criteriaBuilder.and(conjunction, orPredicate)).thenReturn(finalPredicate);

        Predicate result = specification.toPredicate(root, query, criteriaBuilder);

        assertSame(finalPredicate, result);
        verify(root).get("name");
        verify(root).get("email");
        verify(root).get("studentId");
        verify(criteriaBuilder).like(loweredName, "%alice%");
        verify(criteriaBuilder).like(loweredEmail, "%alice%");
        verify(criteriaBuilder).like(loweredStudentId, "%alice%");
        verify(criteriaBuilder).or(namePredicate, emailPredicate, studentIdPredicate);
        verify(criteriaBuilder).and(conjunction, orPredicate);
    }

    @Test
    void byFiltersAddsDepartmentYearAndSemesterPredicates() {
        StudentFilterDto filterDto = new StudentFilterDto();
        filterDto.setDepartment("IT");
        filterDto.setYear(3);
        filterDto.setSemester(2);

        Specification<StudentEntity> specification = StudentSpecifications.byFilters(filterDto);

        Root<StudentEntity> root = mock(Root.class);
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        CriteriaBuilder criteriaBuilder = mock(CriteriaBuilder.class);
        Path<Object> departmentPath = mock(Path.class);
        Path<Object> yearPath = mock(Path.class);
        Path<Object> semesterPath = mock(Path.class);
        Predicate conjunction = mock(Predicate.class);
        Predicate departmentPredicate = mock(Predicate.class);
        Predicate yearPredicate = mock(Predicate.class);
        Predicate semesterPredicate = mock(Predicate.class);
        Predicate afterDepartment = mock(Predicate.class);
        Predicate afterYear = mock(Predicate.class);
        Predicate afterSemester = mock(Predicate.class);

        when(criteriaBuilder.conjunction()).thenReturn(conjunction);
        when(root.get("department")).thenReturn(departmentPath);
        when(root.get("year")).thenReturn(yearPath);
        when(root.get("semester")).thenReturn(semesterPath);
        when(criteriaBuilder.equal(departmentPath, "IT")).thenReturn(departmentPredicate);
        when(criteriaBuilder.equal(yearPath, 3)).thenReturn(yearPredicate);
        when(criteriaBuilder.equal(semesterPath, 2)).thenReturn(semesterPredicate);
        when(criteriaBuilder.and(conjunction, departmentPredicate)).thenReturn(afterDepartment);
        when(criteriaBuilder.and(afterDepartment, yearPredicate)).thenReturn(afterYear);
        when(criteriaBuilder.and(afterYear, semesterPredicate)).thenReturn(afterSemester);

        Predicate result = specification.toPredicate(root, query, criteriaBuilder);

        assertSame(afterSemester, result);
        verify(criteriaBuilder).equal(departmentPath, "IT");
        verify(criteriaBuilder).equal(yearPath, 3);
        verify(criteriaBuilder).equal(semesterPath, 2);
        verify(criteriaBuilder).and(conjunction, departmentPredicate);
        verify(criteriaBuilder).and(afterDepartment, yearPredicate);
        verify(criteriaBuilder).and(afterYear, semesterPredicate);
    }
}
