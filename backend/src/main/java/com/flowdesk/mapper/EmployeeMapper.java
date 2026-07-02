package com.flowdesk.mapper;

import com.flowdesk.dto.response.EmployeeDto;
import com.flowdesk.entity.User;
import com.flowdesk.entity.UserSkill;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {
    @Mapping(target = "id", source = "displayId")
    @Mapping(target = "name", expression = "java(user.getFullName())")
    @Mapping(target = "role", source = "jobTitle")
    @Mapping(target = "dept", expression = "java(user.getDepartment() != null ? user.getDepartment().getName() : null)")
    @Mapping(target = "status", expression = "java(user.getStatus() != null ? user.getStatus().name() : null)")
    @Mapping(target = "manager", expression = "java(user.getManager() != null ? user.getManager().getFullName() : null)")
    @Mapping(target = "skills", expression = "java(mapSkills(user.getSkills()))")
    @Mapping(target = "joinDate", expression = "java(com.flowdesk.util.DateTimeUtil.formatLocalDate(user.getJoinDate()))")
    @Mapping(target = "reports", source = "directReports")
    EmployeeDto toDto(User user);

    List<EmployeeDto> toDtoList(List<User> users);

    default List<String> mapSkills(List<UserSkill> skills) {
        if (skills == null) return List.of();
        return skills.stream().map(UserSkill::getSkill).collect(Collectors.toList());
    }
}
