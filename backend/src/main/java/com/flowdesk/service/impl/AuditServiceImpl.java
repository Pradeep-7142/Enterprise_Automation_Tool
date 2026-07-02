package com.flowdesk.service.impl;

import com.flowdesk.constant.Enums;
import com.flowdesk.dto.response.AuditLogDto;
import com.flowdesk.dto.response.PageResponse;
import com.flowdesk.entity.AuditLog;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.mapper.AuditLogMapper;
import com.flowdesk.repository.AuditLogRepository;
import com.flowdesk.service.AuditService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@Transactional(readOnly = true)
public class AuditServiceImpl implements AuditService {
    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    public AuditServiceImpl(AuditLogRepository auditLogRepository, AuditLogMapper auditLogMapper) {
        this.auditLogRepository = auditLogRepository;
        this.auditLogMapper = auditLogMapper;
    }

    @Override
    public PageResponse<AuditLogDto> list(int page, int limit) {
        User user = requireUser();
        var result = auditLogRepository.findByOrganizationIdAndDeletedFalseOrderByOccurredAtDesc(
                user.getOrganization().getId(), PageRequest.of(Math.max(page - 1, 0), limit, Sort.by(Sort.Direction.DESC, "occurredAt")));
        return PageResponse.<AuditLogDto>builder()
                .items(auditLogMapper.toDtoList(result.getContent()))
                .total(result.getTotalElements()).page(page).limit(limit).build();
    }

    @Override
    @Transactional
    public void log(String userName, String action, String resource, String detail, String ip, Enums.AuditLogType type) {
        User current = SecurityUtils.getCurrentUser();
        AuditLog log = new AuditLog();
        log.setUserName(userName);
        log.setAction(action);
        log.setResource(resource);
        log.setDetail(detail);
        log.setIpAddress(ip);
        log.setType(type);
        log.setOccurredAt(Instant.now());
        if (current != null) {
            log.setUser(current);
            log.setOrganization(current.getOrganization());
        }
        auditLogRepository.save(log);
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
