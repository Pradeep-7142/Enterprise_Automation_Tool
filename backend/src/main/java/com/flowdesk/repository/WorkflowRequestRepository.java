package com.flowdesk.repository;

import com.flowdesk.constant.Enums;
import com.flowdesk.entity.WorkflowRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowRequestRepository extends JpaRepository<WorkflowRequest, UUID> {
    Optional<WorkflowRequest> findByRequestNumberAndDeletedFalse(String requestNumber);
    Page<WorkflowRequest> findByOrganizationIdAndDeletedFalse(UUID organizationId, Pageable pageable);
    Page<WorkflowRequest> findByOrganizationIdAndStatusAndDeletedFalse(UUID organizationId, Enums.RequestStatus status, Pageable pageable);
    Page<WorkflowRequest> findByAssigneeIdAndDeletedFalse(UUID assigneeId, Pageable pageable);
    @Query("SELECT r FROM WorkflowRequest r WHERE r.deleted = false AND r.organization.id = :orgId AND (LOWER(r.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(r.requestNumber) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<WorkflowRequest> search(UUID orgId, String q, Pageable pageable);
    long countByOrganizationIdAndStatusAndDeletedFalse(UUID organizationId, Enums.RequestStatus status);
    List<WorkflowRequest> findTop6ByOrganizationIdAndDeletedFalseOrderByUpdatedAtDesc(UUID organizationId);
}
