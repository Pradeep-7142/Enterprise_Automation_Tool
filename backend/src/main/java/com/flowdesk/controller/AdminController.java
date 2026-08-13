package com.flowdesk.controller;

import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.dto.response.EmployeeDto;
import com.flowdesk.dto.response.PageResponse;
import com.flowdesk.security.Permissions;
import com.flowdesk.service.AdminService;
import com.flowdesk.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize(Permissions.ADMIN)
public class AdminController {
    private final AdminService adminService;
    private final UserService userService;

    public AdminController(AdminService adminService, UserService userService) {
        this.adminService = adminService;
        this.userService = userService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getStats()));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getSystemHealth()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<EmployeeDto>>> users(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dept) {
        return ResponseEntity.ok(ApiResponse.ok(userService.listEmployees(page, limit, search, dept)));
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<ApiResponse<EmployeeDto>> updateUser(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(ApiResponse.ok("User updated", userService.updateEmployee(id, updates)));
    }

    @GetMapping("/org-settings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> orgSettings() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getOrgSettings()));
    }

    @PatchMapping("/org-settings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateOrgSettings(@RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(ApiResponse.ok("Organization settings updated", adminService.updateOrgSettings(settings)));
    }
}
