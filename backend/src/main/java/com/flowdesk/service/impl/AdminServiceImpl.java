package com.flowdesk.service.impl;

import com.flowdesk.constant.Enums;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.repository.*;
import com.flowdesk.service.AdminService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {
    private final UserRepository userRepository;
    private final WorkflowRequestRepository requestRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminServiceImpl(UserRepository userRepository, WorkflowRequestRepository requestRepository,
                            DepartmentRepository departmentRepository, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.departmentRepository = departmentRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public Map<String, Object> getStats() {
        User user = requireUser();
        var orgId = user.getOrganization().getId();
        return Map.of(
                "users", userRepository.findByOrganizationIdAndDeletedFalseOrderByLastNameAsc(orgId).size(),
                "departments", departmentRepository.findByOrganizationIdAndDeletedFalseOrderByNameAsc(orgId).size(),
                "requests", requestRepository.findByOrganizationIdAndDeletedFalse(orgId, org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements(),
                "auditLogs", auditLogRepository.findByOrganizationIdAndDeletedFalseOrderByOccurredAtDesc(orgId, org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements()
        );
    }

    @Override
    public Map<String, Object> getSystemHealth() {
        return Map.of("status", Enums.HealthStatus.healthy.name(), "database", "UP", "cache", "UP", "storage", "UP");
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
