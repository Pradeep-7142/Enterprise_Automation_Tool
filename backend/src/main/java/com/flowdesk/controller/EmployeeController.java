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

    @PostMapping("/import")
    @PreAuthorize(Permissions.ADMIN)
    public ResponseEntity<ApiResponse<Void>> importEmployees(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        userService.importEmployees(file);
        return ResponseEntity.ok(ApiResponse.ok("CSV import completed successfully", null));
    }

    @PatchMapping("/{id}")
    @PreAuthorize(Permissions.ADMIN)
    public ResponseEntity<ApiResponse<EmployeeDto>> updateEmployee(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> updates) {
        return ResponseEntity.ok(ApiResponse.ok("Employee updated", userService.updateEmployee(id, updates)));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize(Permissions.ADMIN)
    public ResponseEntity<ApiResponse<Void>> deactivateEmployee(@PathVariable Integer id) {
        userService.deactivateEmployee(id);
        return ResponseEntity.ok(ApiResponse.ok("Employee deactivated", null));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize(Permissions.ADMIN)
    public ResponseEntity<ApiResponse<Void>> activateEmployee(@PathVariable Integer id) {
        userService.activateEmployee(id);
        return ResponseEntity.ok(ApiResponse.ok("Employee activated", null));
    }
}

