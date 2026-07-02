package com.flowdesk.repository;

import com.flowdesk.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findTopByUserIdAndPurposeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(UUID userId, String purpose, Instant now);
    @Modifying
    @Query("DELETE FROM OtpToken o WHERE o.expiresAt < :cutoff OR o.used = true")
    int deleteExpiredOrUsed(Instant cutoff);
}
