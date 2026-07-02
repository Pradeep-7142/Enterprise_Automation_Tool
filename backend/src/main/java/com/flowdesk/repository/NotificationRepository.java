package com.flowdesk.repository;

import com.flowdesk.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(UUID userId);
    List<Notification> findByUserIdAndReadFalseAndDeletedFalseOrderByCreatedAtDesc(UUID userId);
    long countByUserIdAndReadFalseAndDeletedFalse(UUID userId);
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId AND n.read = false")
    int markAllRead(UUID userId);
}
