package com.flowdesk.repository;

import com.flowdesk.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    List<Department> findByOrganizationIdAndDeletedFalseOrderByNameAsc(UUID organizationId);
    Optional<Department> findByDisplayIdAndDeletedFalse(Integer displayId);
    Optional<Department> findByNameAndOrganizationIdAndDeletedFalse(String name, UUID organizationId);
    @Query("SELECT d FROM Department d WHERE d.deleted = false AND LOWER(d.name) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Department> searchByName(String q);
}
