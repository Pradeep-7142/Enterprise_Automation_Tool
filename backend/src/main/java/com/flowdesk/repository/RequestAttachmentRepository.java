package com.flowdesk.repository;

import com.flowdesk.entity.RequestAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RequestAttachmentRepository extends JpaRepository<RequestAttachment, UUID> {
    List<RequestAttachment> findByRequestIdAndDeletedFalse(UUID requestId);
}
