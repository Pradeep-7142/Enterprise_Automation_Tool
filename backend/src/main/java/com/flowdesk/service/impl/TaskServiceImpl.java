package com.flowdesk.service.impl;

import com.flowdesk.dto.response.TaskDto;
import com.flowdesk.service.RequestService;
import com.flowdesk.service.TaskService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TaskServiceImpl implements TaskService {
    private final RequestService requestService;

    public TaskServiceImpl(RequestService requestService) {
        this.requestService = requestService;
    }

    @Override
    public List<TaskDto> listTasks() {
        return requestService.getPendingApprovals().stream().map(r -> TaskDto.builder()
                .id(r.getId() != null ? Integer.parseInt(r.getId().replace("REQ-", "")) : 0)
                .title("Review " + r.getTitle() + " " + r.getId())
                .due("Today").priority(r.getPriority()).done(false).category("Approval").requestId(r.getId())
                .build()).toList();
    }
}
