package com.flowdesk.mapper;

import com.flowdesk.dto.response.RequestDto;
import com.flowdesk.entity.WorkflowRequest;
import com.flowdesk.util.DateTimeUtil;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RequestMapper {
    @Mapping(target = "id", source = "requestNumber")
    @Mapping(target = "dept", expression = "java(entity.getDepartment() != null ? entity.getDepartment().getName() : null)")
    @Mapping(target = "priority", expression = "java(entity.getPriority() != null ? entity.getPriority().name() : null)")
    @Mapping(target = "status", expression = "java(entity.getStatus() != null ? entity.getStatus().name() : null)")
    @Mapping(target = "assignee", expression = "java(entity.getAssignee() != null ? entity.getAssignee().getFullName() : null)")
    @Mapping(target = "step", source = "currentStep")
    @Mapping(target = "created", expression = "java(com.flowdesk.util.DateTimeUtil.formatDate(entity.getCreatedAt()))")
    @Mapping(target = "updated", expression = "java(com.flowdesk.util.DateTimeUtil.formatDate(entity.getUpdatedAt()))")
    RequestDto toDto(WorkflowRequest entity);

    List<RequestDto> toDtoList(List<WorkflowRequest> entities);
}
