package com.flowdesk.repository;

import com.flowdesk.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findByOrganizationIdAndDeletedFalseOrderByUpdatedAtDesc(UUID organizationId);
    Optional<Conversation> findByDisplayIdAndDeletedFalse(Integer displayId);

    @Query("SELECT COALESCE(MAX(c.displayId), 0) FROM Conversation c")
    Integer findMaxDisplayId();
}
