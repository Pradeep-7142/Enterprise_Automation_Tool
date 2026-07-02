package com.flowdesk.service;

import com.flowdesk.dto.response.DepartmentDto;
import java.util.List;

public interface DepartmentService {
    List<DepartmentDto> listAll();
    DepartmentDto getByDisplayId(Integer displayId);
}
