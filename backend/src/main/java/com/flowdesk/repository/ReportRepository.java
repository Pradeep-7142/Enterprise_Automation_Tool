package com.flowdesk.repository;

import com.flowdesk.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByOrganizationIdAndDeletedFalseOrderByCreatedAtDesc(UUID organizationId);
}
