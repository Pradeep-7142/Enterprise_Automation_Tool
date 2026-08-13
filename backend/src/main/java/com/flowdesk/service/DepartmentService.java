package com.flowdesk.service;

import com.flowdesk.dto.response.DepartmentDto;
import java.util.List;

public interface DepartmentService {
    List<DepartmentDto> listAll();
    DepartmentDto getByDisplayId(Integer displayId);
    DepartmentDto create(java.util.Map<String, Object> body);
    DepartmentDto update(Integer displayId, java.util.Map<String, Object> body);
    void delete(Integer displayId);
}
