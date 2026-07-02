package com.flowdesk.mapper;

import com.flowdesk.dto.response.FileDto;
import com.flowdesk.entity.FileMetadata;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FileMapper {
    @Mapping(target = "id", source = "displayId")
    @Mapping(target = "type", expression = "java(f.getType() != null ? f.getType().name() : null)")
    @Mapping(target = "size", source = "sizeLabel")
    @Mapping(target = "modified", expression = "java(com.flowdesk.util.DateTimeUtil.formatDisplayDate(f.getUpdatedAt()))")
    @Mapping(target = "items", source = "itemCount")
    FileDto toDto(FileMetadata f);

    List<FileDto> toDtoList(List<FileMetadata> files);
}
