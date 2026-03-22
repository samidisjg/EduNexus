package com.example.fineservice.repository;

import com.example.fineservice.entity.FinePayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FinePaymentRepository extends JpaRepository<FinePayment, Long> {

    List<FinePayment> findByFineFineIdOrderByPaidAtDesc(String fineId);
}
