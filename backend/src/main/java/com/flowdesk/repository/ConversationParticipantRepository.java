package com.flowdesk.repository;

import com.flowdesk.entity.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, UUID> {
    List<ConversationParticipant> findByUserIdAndDeletedFalse(UUID userId);
    Optional<ConversationParticipant> findByConversationIdAndUserIdAndDeletedFalse(UUID conversationId, UUID userId);
}
