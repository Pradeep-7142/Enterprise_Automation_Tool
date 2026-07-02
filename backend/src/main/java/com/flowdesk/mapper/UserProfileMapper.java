package com.flowdesk.mapper;

import com.flowdesk.dto.response.UserProfileDto;
import com.flowdesk.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    @Mapping(target = "id", expression = "java(user.getId() != null ? user.getId().toString() : null)")
    @Mapping(target = "name", expression = "java(user.getFullName())")
    @Mapping(target = "role", expression = "java(user.getRole() != null ? user.getRole().getName().name() : null)")
    @Mapping(target = "dept", expression = "java(user.getDepartment() != null ? user.getDepartment().getName() : null)")
    @Mapping(target = "organization", expression = "java(user.getOrganization() != null ? user.getOrganization().getName() : null)")
    UserProfileDto toDto(User user);
}
