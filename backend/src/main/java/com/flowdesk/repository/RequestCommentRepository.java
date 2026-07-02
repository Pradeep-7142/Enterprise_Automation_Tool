package com.flowdesk.repository;

import com.flowdesk.entity.RequestComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RequestCommentRepository extends JpaRepository<RequestComment, UUID> {
    List<RequestComment> findByRequestIdAndDeletedFalseOrderByCreatedAtAsc(UUID requestId);
}
