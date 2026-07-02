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
public class AnalyticsResponse {
    private List<TrendDataDto> trendData;
    private List<DeptDataDto> deptData;
    private List<Map<String, Object>> statusDist;
    private List<Map<String, Object>> weeklyData;
    private List<Map<String, Object>> approvalTimeData;
    private long totalSubmitted;
    private long totalApproved;
    private long totalRejected;
    private double avgApprovalDays;
}
