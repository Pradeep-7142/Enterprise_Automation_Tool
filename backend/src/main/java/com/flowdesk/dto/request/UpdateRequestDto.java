package com.flowdesk.dto.request;

import lombok.Data;

@Data
public class UpdateRequestDto {
    private String title;
    private String dept;
    private String priority;
    private String status;
    private String category;
    private String description;
    private String step;
}
