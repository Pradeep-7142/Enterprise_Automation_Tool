package com.flowdesk.controller;

import com.flowdesk.dto.request.CreateEmployeeRequest;
import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.dto.response.EmployeeDto;
import com.flowdesk.dto.response.PageResponse;
import com.flowdesk.security.Permissions;
import com.flowdesk.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {
    private final UserService userService;

    public EmployeeController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<EmployeeDto>>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dept) {
        return ResponseEntity.ok(ApiResponse.ok(userService.listEmployees(page, limit, search, dept)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDto>> get(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getEmployee(id)));
    }

    @PostMapping
    @PreAuthorize(Permissions.ADMIN)
    public ResponseEntity<ApiResponse<EmployeeDto>> create(@Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Member added", userService.createEmployee(request)));
    }
}
