package com.flowdesk.mapper;

import com.flowdesk.dto.response.ReportDto;
import com.flowdesk.entity.Report;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReportMapper {
    @Mapping(target = "id", source = "displayId")
    @Mapping(target = "status", expression = "java(r.getStatus() != null ? r.getStatus().name() : null)")
    @Mapping(target = "lastGenerated", expression = "java(com.flowdesk.util.DateTimeUtil.formatDateTime(r.getLastGeneratedAt()))")
    @Mapping(target = "schedule", source = "scheduleCron")
    ReportDto toDto(Report r);

    List<ReportDto> toDtoList(List<Report> reports);
}
