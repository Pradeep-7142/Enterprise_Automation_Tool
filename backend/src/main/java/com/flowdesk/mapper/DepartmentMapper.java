package com.flowdesk.mapper;

import com.flowdesk.dto.response.DepartmentDto;
import com.flowdesk.entity.Department;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {
    @Mapping(target = "id", source = "displayId")
    @Mapping(target = "head", expression = "java(dept.getHead() != null ? dept.getHead().getFullName() : null)")
    @Mapping(target = "requests", source = "requestCount")
    DepartmentDto toDto(Department dept);

    List<DepartmentDto> toDtoList(List<Department> departments);
}
