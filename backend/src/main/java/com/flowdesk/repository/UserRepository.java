package com.flowdesk.repository;

import com.flowdesk.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailAndDeletedFalse(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role LEFT JOIN FETCH u.organization LEFT JOIN FETCH u.department WHERE u.email = :email AND u.deleted = false")
    Optional<User> findByEmailWithRoleAndOrganization(@Param("email") String email);
    Optional<User> findByDisplayIdAndDeletedFalse(Integer displayId);
    Page<User> findByOrganizationIdAndDeletedFalse(UUID organizationId, Pageable pageable);
    List<User> findByOrganizationIdAndDeletedFalseOrderByLastNameAsc(UUID organizationId);
    @Query("SELECT u FROM User u WHERE u.deleted = false AND u.organization.id = :orgId AND (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<User> search(UUID orgId, String q, Pageable pageable);
    long countByDepartmentIdAndDeletedFalse(UUID departmentId);

    @Query("SELECT COALESCE(MAX(u.displayId), 0) FROM User u")
    Integer findMaxDisplayId();
}
