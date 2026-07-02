package com.flowdesk.repository;

import com.flowdesk.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    Page<AuditLog> findByOrganizationIdAndDeletedFalseOrderByOccurredAtDesc(UUID organizationId, Pageable pageable);
}
