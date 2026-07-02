package com.flowdesk.service;

import com.flowdesk.dto.response.WorkflowDto;
import java.util.List;
import java.util.UUID;

public interface WorkflowService {
    List<WorkflowDto> listAll();
    WorkflowDto getById(UUID id);
}
