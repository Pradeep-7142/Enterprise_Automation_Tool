package com.flowdesk.scheduler;

import com.flowdesk.repository.OtpTokenRepository;
import com.flowdesk.repository.RefreshTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
public class TokenCleanupScheduler {
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpTokenRepository otpTokenRepository;

    public TokenCleanupScheduler(RefreshTokenRepository refreshTokenRepository,
                                 OtpTokenRepository otpTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpTokenRepository = otpTokenRepository;
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        Instant cutoff = Instant.now().minus(7, ChronoUnit.DAYS);
        int refreshDeleted = refreshTokenRepository.deleteExpiredOrRevoked(cutoff);
        int otpDeleted = otpTokenRepository.deleteExpiredOrUsed(Instant.now());
        log.info("Token cleanup: removed {} refresh tokens, {} OTP tokens", refreshDeleted, otpDeleted);
    }
}
