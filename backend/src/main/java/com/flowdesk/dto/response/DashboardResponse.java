package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long pendingApprovals;
    private long myRequests;
    private long recentlyCompleted;
    private long totalRequests;
    private List<RequestDto> recentRequests;
    private List<ActivityItemDto> activityFeed;
    private List<Map<String, Object>> upcomingDeadlines;
    private List<NotificationDto> recentNotifications;
}
