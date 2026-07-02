package com.flowdesk.controller;

import com.flowdesk.dto.request.*;
import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.dto.response.PageResponse;
import com.flowdesk.dto.response.RequestDto;
import com.flowdesk.service.RequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/requests")
public class RequestController {
    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RequestDto>>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.list(page, limit, status, search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RequestDto>> get(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.getByRequestNumber(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RequestDto>> create(@Valid @RequestBody CreateRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RequestDto>> update(@PathVariable String id, @RequestBody UpdateRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        requestService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Request deleted", null));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<RequestDto>> approve(@PathVariable String id, @RequestBody ApprovalActionRequest action) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.approve(id, action)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<RequestDto>> reject(@PathVariable String id, @RequestBody ApprovalActionRequest action) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.reject(id, action)));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<RequestDto>>> recent(@RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(requestService.getRecent(limit)));
    }

    @GetMapping("/pending-approvals")
    public ResponseEntity<ApiResponse<List<RequestDto>>> pendingApprovals() {
        return ResponseEntity.ok(ApiResponse.ok(requestService.getPendingApprovals()));
    }
}
