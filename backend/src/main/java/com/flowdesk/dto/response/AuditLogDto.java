package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Integer id;
    private String user;
    private String action;
    private String resource;
    private String detail;
    private String time;
    private String ip;
    private String type;
}
