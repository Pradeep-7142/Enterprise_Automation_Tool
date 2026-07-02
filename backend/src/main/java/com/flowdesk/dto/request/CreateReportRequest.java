package com.flowdesk.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReportRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String type;
    private String description;
    private String schedule;
}
