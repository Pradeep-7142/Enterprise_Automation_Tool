package com.flowdesk.service;

import com.flowdesk.dto.response.TaskDto;
import java.util.List;

public interface TaskService {
    List<TaskDto> listTasks();
}
