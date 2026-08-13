package com.flowdesk.service;

import com.flowdesk.dto.request.CreateEmployeeRequest;
import com.flowdesk.dto.response.EmployeeDto;
import com.flowdesk.dto.response.PageResponse;
import java.util.UUID;

public interface UserService {
    PageResponse<EmployeeDto> listEmployees(int page, int limit, String search, String dept);
    EmployeeDto getEmployee(Integer displayId);
    EmployeeDto getEmployeeById(UUID id);
    EmployeeDto createEmployee(CreateEmployeeRequest request);
    EmployeeDto updateEmployee(Integer displayId, java.util.Map<String, Object> updates);
    void deactivateEmployee(Integer displayId);
    void activateEmployee(Integer displayId);
    void importEmployees(org.springframework.web.multipart.MultipartFile file);
}
