package com.flowdesk.controller;

import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.dto.response.DepartmentDto;
import com.flowdesk.service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {
    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(departmentService.listAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDto>> get(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(departmentService.getByDisplayId(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentDto>> create(@RequestBody java.util.Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("Department created", departmentService.create(body)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDto>> update(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("Department updated", departmentService.update(id, body)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        departmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Department deleted", null));
    }
}
