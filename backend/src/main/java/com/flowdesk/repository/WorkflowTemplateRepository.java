package com.flowdesk.repository;

import com.flowdesk.entity.WorkflowTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface WorkflowTemplateRepository extends JpaRepository<WorkflowTemplate, UUID> {
    List<WorkflowTemplate> findByOrganizationIdAndDeletedFalseOrderByNameAsc(UUID organizationId);
}
