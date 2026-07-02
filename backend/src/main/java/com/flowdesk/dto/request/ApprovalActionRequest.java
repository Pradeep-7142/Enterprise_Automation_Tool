package com.flowdesk.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApprovalActionRequest {
    @NotBlank
    private String action;
    private String comment;
}
