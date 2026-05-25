// ─── src/main/java/com/martzy/backend/repository/AdminRepository.java ───────
package com.martzy.backend.repository;

import com.martzy.backend.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByEmail(String email);

    boolean existsByEmail(String email);
}
