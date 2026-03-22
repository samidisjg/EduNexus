package com.example.fineservice.repository;

import com.example.fineservice.entity.Fine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FineRepository extends JpaRepository<Fine, Long> {

    Optional<Fine> findByFineId(String fineId);

    Optional<Fine> findByBorrowId(Long borrowId);

    List<Fine> findAllByOrderByCreatedAtDesc();

    List<Fine> findByStudentIdOrderByCreatedAtDesc(String studentId);

    boolean existsByBorrowId(Long borrowId);

    boolean existsByFineId(String fineId);
}
