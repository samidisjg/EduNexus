package com.sliit.studentservice.repository;

import com.sliit.studentservice.entity.StudentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentManagementRepository extends JpaRepository<StudentEntity, Long>, JpaSpecificationExecutor<StudentEntity> {
    boolean existsByStudentId(String studentId);

    boolean existsByEmail(String email);

    Optional<StudentEntity> findByStudentId(String studentId);

    @Query("SELECT COUNT(e) FROM EnrollmentEntity e WHERE e.courseId = :courseId")
    long countEnrollmentsByCourseId(@Param("courseId") String courseId);
}
