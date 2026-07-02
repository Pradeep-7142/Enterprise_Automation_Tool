package com.flowdesk.mapper;

import com.flowdesk.dto.response.*;
import com.flowdesk.entity.*;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WorkflowMapper {
    @Mapping(target = "id", expression = "java(template.getId() != null ? template.getId().toString() : null)")
    @Mapping(target = "status", expression = "java(template.getStatus() != null ? template.getStatus().name() : null)")
    @Mapping(target = "version", source = "templateVersion")
    @Mapping(target = "nodes", source = "nodes")
    @Mapping(target = "edges", source = "edges")
    WorkflowDto toDto(WorkflowTemplate template);

    List<WorkflowDto> toDtoList(List<WorkflowTemplate> templates);

    @Mapping(target = "id", expression = "java(node.getId() != null ? node.getId().toString() : null)")
    @Mapping(target = "label", source = "label")
    @Mapping(target = "type", expression = "java(node.getType() != null ? node.getType().name() : null)")
    @Mapping(target = "x", source = "posX")
    @Mapping(target = "y", source = "posY")
    WorkflowNodeDto toNodeDto(WorkflowNode node);

    @Mapping(target = "id", expression = "java(edge.getId() != null ? edge.getId().toString() : null)")
    @Mapping(target = "source", expression = "java(edge.getSourceNode() != null ? edge.getSourceNode().getId().toString() : null)")
    @Mapping(target = "target", expression = "java(edge.getTargetNode() != null ? edge.getTargetNode().getId().toString() : null)")
    WorkflowEdgeDto toEdgeDto(WorkflowEdge edge);
}
