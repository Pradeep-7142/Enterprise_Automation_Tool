package com.flowdesk.repository;

import com.flowdesk.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findByOrganizationIdAndDeletedFalseOrderByUpdatedAtDesc(UUID organizationId);
    Optional<Conversation> findByDisplayIdAndDeletedFalse(Integer displayId);
}
