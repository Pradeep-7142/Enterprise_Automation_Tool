package com.flowdesk.repository;

import com.flowdesk.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByConversationIdAndDeletedFalseOrderByCreatedAtAsc(UUID conversationId);

    @Query("SELECT COALESCE(MAX(m.displayId), 0) FROM Message m")
    Integer findMaxDisplayId();
}
