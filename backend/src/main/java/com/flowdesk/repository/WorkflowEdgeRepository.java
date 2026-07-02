package com.flowdesk.repository;

import com.flowdesk.entity.WorkflowEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface WorkflowEdgeRepository extends JpaRepository<WorkflowEdge, UUID> {
    List<WorkflowEdge> findByTemplateIdAndDeletedFalse(UUID templateId);
}
