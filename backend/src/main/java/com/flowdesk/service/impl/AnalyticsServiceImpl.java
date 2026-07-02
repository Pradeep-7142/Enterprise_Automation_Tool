package com.flowdesk.service.impl;

import com.flowdesk.constant.Enums;
import com.flowdesk.dto.response.*;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.repository.DepartmentRepository;
import com.flowdesk.repository.WorkflowRequestRepository;
import com.flowdesk.service.AnalyticsService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {
    private final WorkflowRequestRepository requestRepository;
    private final DepartmentRepository departmentRepository;

    public AnalyticsServiceImpl(WorkflowRequestRepository requestRepository, DepartmentRepository departmentRepository) {
        this.requestRepository = requestRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    @Cacheable("analytics")
    public AnalyticsResponse getAnalytics() {
        User user = requireUser();
        var orgId = user.getOrganization().getId();
        long approved = requestRepository.countByOrganizationIdAndStatusAndDeletedFalse(orgId, Enums.RequestStatus.approved);
        long rejected = requestRepository.countByOrganizationIdAndStatusAndDeletedFalse(orgId, Enums.RequestStatus.rejected);
        long pending = requestRepository.countByOrganizationIdAndStatusAndDeletedFalse(orgId, Enums.RequestStatus.pending);
        long inReview = requestRepository.countByOrganizationIdAndStatusAndDeletedFalse(orgId, Enums.RequestStatus.in_review);
        long total = approved + rejected + pending + inReview;
        return AnalyticsResponse.builder()
                .trendData(List.of(
                        TrendDataDto.builder().month("Jul").submitted(45).approved(38).rejected(7).build(),
                        TrendDataDto.builder().month("Aug").submitted(52).approved(44).rejected(8).build(),
                        TrendDataDto.builder().month("Sep").submitted(48).approved(41).rejected(7).build(),
                        TrendDataDto.builder().month("Oct").submitted(63).approved(54).rejected(9).build(),
                        TrendDataDto.builder().month("Nov").submitted(71).approved(60).rejected(11).build(),
                        TrendDataDto.builder().month("Dec").submitted(58).approved(50).rejected(8).build(),
                        TrendDataDto.builder().month("Jan").submitted(82).approved(69).rejected(13).build()))
                .deptData(departmentRepository.findByOrganizationIdAndDeletedFalseOrderByNameAsc(orgId).stream()
                        .map(d -> DeptDataDto.builder()
                                .dept(d.getName()).requests(d.getRequestCount())
                                .approved((int)(d.getRequestCount() * d.getPerformance() / 100.0))
                                .avg_days(2.5).build()).toList())
                .statusDist(List.of(
                        Map.of("name", "Approved", "value", 486, "color", "#059669"),
                        Map.of("name", "Pending", "value", 142, "color", "#d97706"),
                        Map.of("name", "In Review", "value", 98, "color", "#2563eb"),
                        Map.of("name", "Rejected", "value", 54, "color", "#dc2626"),
                        Map.of("name", "Draft", "value", 32, "color", "#94a3b8")))
                .weeklyData(List.of(
                        Map.of("day", "Mon", "requests", 18, "completed", 14),
                        Map.of("day", "Tue", "requests", 24, "completed", 20),
                        Map.of("day", "Wed", "requests", 31, "completed", 26),
                        Map.of("day", "Thu", "requests", 22, "completed", 19),
                        Map.of("day", "Fri", "requests", 28, "completed", 25),
                        Map.of("day", "Sat", "requests", 9, "completed", 8),
                        Map.of("day", "Sun", "requests", 5, "completed", 5)))
                .approvalTimeData(List.of(
                        Map.of("name", "<1 day", "value", 38),
                        Map.of("name", "1–2 days", "value", 29),
                        Map.of("name", "3–5 days", "value", 19),
                        Map.of("name", ">5 days", "value", 14)))
                .totalSubmitted(total).totalApproved(approved).totalRejected(rejected).avgApprovalDays(2.4)
                .build();
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
