package com.flowdesk.repository;

import com.flowdesk.entity.WorkflowNode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface WorkflowNodeRepository extends JpaRepository<WorkflowNode, UUID> {
    List<WorkflowNode> findByTemplateIdAndDeletedFalse(UUID templateId);
}
