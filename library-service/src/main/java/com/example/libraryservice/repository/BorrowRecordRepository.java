package com.example.libraryservice.repository;

import com.example.libraryservice.entity.BorrowRecord;
import com.example.libraryservice.entity.BorrowStatus;
import com.example.libraryservice.entity.FineStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findAllByOrderByCreatedAtDesc();

    List<BorrowRecord> findByStudentIdOrderByBorrowDateDesc(String studentId);

    List<BorrowRecord> findByStatusOrderByBorrowDateDesc(BorrowStatus status);

    @Query("""
            select br
            from BorrowRecord br
            where br.status = :borrowStatus
              and br.dueDate < :today
              and (br.fineId is null or br.fineStatus = :noFineStatus)
            order by br.dueDate asc
            """)
    List<BorrowRecord> findOverdueBorrowingsWithoutFine(
            @Param("borrowStatus") BorrowStatus borrowStatus,
            @Param("today") LocalDate today,
            @Param("noFineStatus") FineStatus noFineStatus
    );

    boolean existsByBookIdAndStatus(Long bookId, BorrowStatus status);
}
