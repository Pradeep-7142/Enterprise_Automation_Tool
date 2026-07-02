package com.flowdesk.service.impl;

import com.flowdesk.constant.Enums;
import com.flowdesk.dto.response.*;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.repository.NotificationRepository;
import com.flowdesk.repository.WorkflowRequestRepository;
import com.flowdesk.service.DashboardService;
import com.flowdesk.service.RequestService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {
    private final WorkflowRequestRepository requestRepository;
    private final NotificationRepository notificationRepository;
    private final RequestService requestService;

    public DashboardServiceImpl(WorkflowRequestRepository requestRepository,
                                  NotificationRepository notificationRepository,
                                  RequestService requestService) {
        this.requestRepository = requestRepository;
        this.notificationRepository = notificationRepository;
        this.requestService = requestService;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable("dashboard")
    public DashboardResponse getDashboard() {
        User user = requireUser();
        var orgId = user.getOrganization().getId();
        long pending = requestRepository.countByOrganizationIdAndStatusAndDeletedFalse(orgId, Enums.RequestStatus.pending)
                + requestRepository.countByOrganizationIdAndStatusAndDeletedFalse(orgId, Enums.RequestStatus.in_review);
        long myRequests = requestRepository.findByAssigneeIdAndDeletedFalse(user.getId(),
                org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
        long completed = requestRepository.countByOrganizationIdAndStatusAndDeletedFalse(orgId, Enums.RequestStatus.approved);
        return DashboardResponse.builder()
                .pendingApprovals(pending).myRequests(myRequests).recentlyCompleted(completed)
                .totalRequests(pending + completed)
                .recentRequests(requestService.getRecent(6))
                .activityFeed(List.of(
                        ActivityItemDto.builder().id(1).user("Alice Chen").action("approved").target("REQ-2403").time("2 min ago").avatar("AC").color("#059669").build(),
                        ActivityItemDto.builder().id(2).user("Bob Martinez").action("commented on").target("REQ-2402").time("18 min ago").avatar("BM").color("#2563eb").build()))
                .upcomingDeadlines(List.of(Map.of("label", "REQ-2407 Due", "date", "2024-01-17")))
                .recentNotifications(notificationRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId())
                        .stream().limit(5).map(n -> NotificationDto.builder()
                                .id(n.getDisplayId()).type(n.getType().name()).title(n.getTitle())
                                .desc(n.getDescription()).read(n.isRead()).priority(n.getPriority().name()).build()).toList())
                .build();
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
