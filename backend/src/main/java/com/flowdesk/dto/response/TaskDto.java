package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Integer id;
    private String title;
    private String due;
    private String priority;
    private Boolean done;
    private String category;
    private String requestId;
}
