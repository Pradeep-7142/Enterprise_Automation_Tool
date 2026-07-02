package com.flowdesk.controller;

import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.dto.response.WorkflowDto;
import com.flowdesk.service.WorkflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workflows")
public class WorkflowController {
    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkflowDto>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(workflowService.listAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkflowDto>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(workflowService.getById(id)));
    }
}
