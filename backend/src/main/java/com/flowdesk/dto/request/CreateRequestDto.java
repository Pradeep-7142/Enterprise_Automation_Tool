package com.flowdesk.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateRequestDto {
    @NotBlank
    private String title;
    private String dept;
    private String priority;
    private String category;
    private String description;
    private String assigneeEmail;
}
