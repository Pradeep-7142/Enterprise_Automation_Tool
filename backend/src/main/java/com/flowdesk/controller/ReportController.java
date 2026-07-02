package com.flowdesk.controller;

import com.flowdesk.dto.request.CreateReportRequest;
import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.dto.response.ReportDto;
import com.flowdesk.security.Permissions;
import com.flowdesk.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportDto>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.listAll()));
    }

    @PostMapping
    @PreAuthorize(Permissions.APPROVER)
    public ResponseEntity<ApiResponse<ReportDto>> create(@Valid @RequestBody CreateReportRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.create(request)));
    }
}
