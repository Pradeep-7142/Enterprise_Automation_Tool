package com.flowdesk.controller;

import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.dto.response.RequestDto;
import com.flowdesk.service.RequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/approvals")
public class ApprovalController {
    private final RequestService requestService;

    public ApprovalController(RequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RequestDto>>> getApprovals() {
        return ResponseEntity.ok(ApiResponse.ok(requestService.getPendingApprovals()));
    }
}
