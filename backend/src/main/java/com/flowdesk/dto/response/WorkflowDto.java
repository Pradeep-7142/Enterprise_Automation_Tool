package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowDto {
    private String id;
    private String name;
    private String description;
    private String status;
    private int version;
    private List<WorkflowNodeDto> nodes;
    private List<WorkflowEdgeDto> edges;
}
