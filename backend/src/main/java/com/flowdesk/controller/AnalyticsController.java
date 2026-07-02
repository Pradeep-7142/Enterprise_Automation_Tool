package com.flowdesk.controller;

import com.flowdesk.dto.response.AnalyticsResponse;
import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getAnalytics()));
    }
}
