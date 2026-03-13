package com.sliit.userservice.repository;

import com.sliit.userservice.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @Author User-Service
 * @Created on 03/05/2025
 * @Project API-Gateway-Testing
 * @Description: Repository for User Entity
 */
@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUserEmail(String userEmail);
    Optional<UserEntity> findByUserName(String userName);
    Optional<UserEntity> findByUserIdAndIsActiveTrue(Long userId);
}

