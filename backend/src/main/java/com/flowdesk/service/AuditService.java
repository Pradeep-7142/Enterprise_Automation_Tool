package com.flowdesk.service;

import com.flowdesk.dto.response.AuditLogDto;
import com.flowdesk.dto.response.PageResponse;

public interface AuditService {
    PageResponse<AuditLogDto> list(int page, int limit);
    void log(String userName, String action, String resource, String detail, String ip, com.flowdesk.constant.Enums.AuditLogType type);
}
