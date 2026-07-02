package com.flowdesk.service;

import com.flowdesk.dto.request.CreateReportRequest;
import com.flowdesk.dto.response.ReportDto;
import java.util.List;

public interface ReportService {
    List<ReportDto> listAll();
    ReportDto create(CreateReportRequest request);
}
