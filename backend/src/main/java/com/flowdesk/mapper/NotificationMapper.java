package com.flowdesk.mapper;

import com.flowdesk.dto.response.NotificationDto;
import com.flowdesk.entity.Notification;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    @Mapping(target = "id", source = "displayId")
    @Mapping(target = "type", expression = "java(n.getType() != null ? n.getType().name() : null)")
    @Mapping(target = "desc", source = "description")
    @Mapping(target = "time", expression = "java(com.flowdesk.util.DateTimeUtil.relativeTime(n.getCreatedAt()))")
    @Mapping(target = "priority", expression = "java(n.getPriority() != null ? n.getPriority().name() : null)")
    NotificationDto toDto(Notification n);

    List<NotificationDto> toDtoList(List<Notification> notifications);
}
