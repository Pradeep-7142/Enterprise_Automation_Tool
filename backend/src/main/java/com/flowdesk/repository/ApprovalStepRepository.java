package com.flowdesk.repository;

import com.flowdesk.entity.ApprovalStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, UUID> {
    List<ApprovalStep> findByRequestIdAndDeletedFalseOrderByStepOrderAsc(UUID requestId);
}
