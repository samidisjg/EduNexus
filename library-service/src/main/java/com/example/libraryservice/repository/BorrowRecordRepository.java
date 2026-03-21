package com.example.libraryservice.repository;

import com.example.libraryservice.entity.BorrowRecord;
import com.example.libraryservice.entity.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findAllByOrderByCreatedAtDesc();

    List<BorrowRecord> findByStudentIdOrderByBorrowDateDesc(String studentId);

    List<BorrowRecord> findByStatusOrderByBorrowDateDesc(BorrowStatus status);

    boolean existsByBookIdAndStatus(Long bookId, BorrowStatus status);
}
