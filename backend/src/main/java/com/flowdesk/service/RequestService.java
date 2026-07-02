package com.flowdesk.service;

import com.flowdesk.dto.request.*;
import com.flowdesk.dto.response.PageResponse;
import com.flowdesk.dto.response.RequestDto;
import java.util.List;

public interface RequestService {
    PageResponse<RequestDto> list(int page, int limit, String status, String search);
    RequestDto getByRequestNumber(String requestNumber);
    RequestDto create(CreateRequestDto dto);
    RequestDto update(String requestNumber, UpdateRequestDto dto);
    void delete(String requestNumber);
    RequestDto approve(String requestNumber, ApprovalActionRequest action);
    RequestDto reject(String requestNumber, ApprovalActionRequest action);
    List<RequestDto> getRecent(int limit);
    List<RequestDto> getPendingApprovals();
}
