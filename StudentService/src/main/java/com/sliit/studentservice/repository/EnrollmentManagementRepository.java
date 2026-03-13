package com.sliit.studentservice.repository;

import com.sliit.studentservice.entity.EnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentManagementRepository extends JpaRepository<EnrollmentEntity, Long> {
    List<EnrollmentEntity> findByStudentId(String studentId);

    boolean existsByStudentIdAndCourseId(String studentId, String courseId);
}
