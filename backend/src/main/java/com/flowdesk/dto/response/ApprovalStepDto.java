package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStepDto {
    private UUID id;
    private String name;
    private String label;
    private String status;
    private String assigneeName;
    private String approver;
    private String comment;
    private Integer stepOrder;
}
