package com.flowdesk.mapper;

import com.flowdesk.dto.response.AuditLogDto;
import com.flowdesk.entity.AuditLog;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {
    @Mapping(target = "id", source = "displayId")
    @Mapping(target = "user", source = "userName")
    @Mapping(target = "time", expression = "java(com.flowdesk.util.DateTimeUtil.formatDateTime(log.getOccurredAt()))")
    @Mapping(target = "ip", source = "ipAddress")
    @Mapping(target = "type", expression = "java(log.getType() != null ? log.getType().name() : null)")
    AuditLogDto toDto(AuditLog log);

    List<AuditLogDto> toDtoList(List<AuditLog> logs);
}
