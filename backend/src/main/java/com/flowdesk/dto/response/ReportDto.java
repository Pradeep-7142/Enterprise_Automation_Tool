package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDto {
    private Integer id;
    private String title;
    private String type;
    private String status;
    private String description;
    private String lastGenerated;
    private String schedule;
}
