package com.flowdesk.service.impl;

import com.flowdesk.constant.Enums;
import com.flowdesk.dto.request.ApprovalActionRequest;
import com.flowdesk.dto.request.CreateRequestDto;
import com.flowdesk.dto.request.UpdateRequestDto;
import com.flowdesk.dto.response.PageResponse;
import com.flowdesk.dto.response.RequestDto;
import com.flowdesk.entity.Department;
import com.flowdesk.entity.User;
import com.flowdesk.entity.WorkflowRequest;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.exception.ResourceNotFoundException;
import com.flowdesk.mapper.RequestMapper;
import com.flowdesk.repository.DepartmentRepository;
import com.flowdesk.repository.UserRepository;
import com.flowdesk.repository.WorkflowRequestRepository;
import com.flowdesk.service.AuditService;
import com.flowdesk.service.RequestService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class RequestServiceImpl implements RequestService {

    private final WorkflowRequestRepository requestRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final RequestMapper requestMapper;
    private final AuditService auditService;

    public RequestServiceImpl(WorkflowRequestRepository requestRepository,
                              DepartmentRepository departmentRepository,
                              UserRepository userRepository,
                              RequestMapper requestMapper,
                              AuditService auditService) {
        this.requestRepository = requestRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.requestMapper = requestMapper;
        this.auditService = auditService;
    }

    @Override
    public PageResponse<RequestDto> list(int page, int limit, String status, String search) {
        User current = requireUser();
        PageRequest pageable = PageRequest.of(Math.max(page - 1, 0), limit, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<WorkflowRequest> result;
        if (StringUtils.hasText(search)) {
            result = requestRepository.search(current.getOrganization().getId(), search, pageable);
        } else if (StringUtils.hasText(status)) {
            result = requestRepository.findByOrganizationIdAndStatusAndDeletedFalse(
                    current.getOrganization().getId(), Enums.RequestStatus.valueOf(status), pageable);
        } else {
            result = requestRepository.findByOrganizationIdAndDeletedFalse(current.getOrganization().getId(), pageable);
        }
        return PageResponse.<RequestDto>builder()
                .items(requestMapper.toDtoList(result.getContent()))
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .build();
    }

    @Override
    public RequestDto getByRequestNumber(String requestNumber) {
        return requestMapper.toDto(findRequest(requestNumber));
    }

    @Override
    @Transactional
    public RequestDto create(CreateRequestDto dto) {
        User current = requireUser();
        WorkflowRequest request = new WorkflowRequest();
        request.setRequestNumber(generateRequestNumber());
        request.setTitle(dto.getTitle());
        request.setOrganization(current.getOrganization());
        request.setRequester(current);
        request.setPriority(parsePriority(dto.getPriority()));
        request.setStatus(Enums.RequestStatus.pending);
        request.setCategory(dto.getCategory());
        request.setDescription(dto.getDescription());
        request.setCurrentStep("Submitted");
        if (StringUtils.hasText(dto.getDept())) {
            departmentRepository.findByNameAndOrganizationIdAndDeletedFalse(dto.getDept(), current.getOrganization().getId())
                    .ifPresent(request::setDepartment);
        }
        if (StringUtils.hasText(dto.getAssigneeEmail())) {
            userRepository.findByEmailAndDeletedFalse(dto.getAssigneeEmail()).ifPresent(request::setAssignee);
        } else {
            request.setAssignee(current);
        }
        WorkflowRequest saved = requestRepository.save(request);
        auditService.log(current.getFullName(), "Created", saved.getRequestNumber(),
                "New request submitted: " + saved.getTitle(), null, Enums.AuditLogType.create);
        return requestMapper.toDto(saved);
    }

    @Override
    @Transactional
    public RequestDto update(String requestNumber, UpdateRequestDto dto) {
        WorkflowRequest request = findRequest(requestNumber);
        if (StringUtils.hasText(dto.getTitle())) request.setTitle(dto.getTitle());
        if (StringUtils.hasText(dto.getPriority())) request.setPriority(parsePriority(dto.getPriority()));
        if (StringUtils.hasText(dto.getStatus())) request.setStatus(Enums.RequestStatus.valueOf(dto.getStatus()));
        if (StringUtils.hasText(dto.getCategory())) request.setCategory(dto.getCategory());
        if (StringUtils.hasText(dto.getDescription())) request.setDescription(dto.getDescription());
        if (StringUtils.hasText(dto.getStep())) request.setCurrentStep(dto.getStep());
        if (StringUtils.hasText(dto.getDept())) {
            departmentRepository.findByNameAndOrganizationIdAndDeletedFalse(dto.getDept(),
                    request.getOrganization().getId()).ifPresent(request::setDepartment);
        }
        return requestMapper.toDto(requestRepository.save(request));
    }

    @Override
    @Transactional
    public void delete(String requestNumber) {
        WorkflowRequest request = findRequest(requestNumber);
        request.setDeleted(true);
        requestRepository.save(request);
    }

    @Override
    @Transactional
    public RequestDto approve(String requestNumber, ApprovalActionRequest action) {
        WorkflowRequest request = findRequest(requestNumber);
        request.setStatus(Enums.RequestStatus.approved);
        request.setCurrentStep("Completed");
        User current = requireUser();
        auditService.log(current.getFullName(), "Approved", requestNumber,
                action.getComment() != null ? action.getComment() : "Request approved", null, Enums.AuditLogType.approval);
        return requestMapper.toDto(requestRepository.save(request));
    }

    @Override
    @Transactional
    public RequestDto reject(String requestNumber, ApprovalActionRequest action) {
        WorkflowRequest request = findRequest(requestNumber);
        request.setStatus(Enums.RequestStatus.rejected);
        request.setCurrentStep("Rejected");
        User current = requireUser();
        auditService.log(current.getFullName(), "Rejected", requestNumber,
                action.getComment() != null ? action.getComment() : "Request rejected", null, Enums.AuditLogType.rejection);
        return requestMapper.toDto(requestRepository.save(request));
    }

    @Override
    public List<RequestDto> getRecent(int limit) {
        User current = requireUser();
        return requestMapper.toDtoList(
                requestRepository.findTop6ByOrganizationIdAndDeletedFalseOrderByUpdatedAtDesc(current.getOrganization().getId())
                        .stream().limit(limit).toList());
    }

    @Override
    public List<RequestDto> getPendingApprovals() {
        User current = requireUser();
        Page<WorkflowRequest> page = requestRepository.findByAssigneeIdAndDeletedFalse(
                current.getId(), PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "updatedAt")));
        return requestMapper.toDtoList(page.getContent().stream()
                .filter(r -> r.getStatus() == Enums.RequestStatus.pending || r.getStatus() == Enums.RequestStatus.in_review)
                .toList());
    }

    private WorkflowRequest findRequest(String requestNumber) {
        return requestRepository.findByRequestNumberAndDeletedFalse(requestNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + requestNumber));
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) {
            throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        }
        return user;
    }

    private Enums.Priority parsePriority(String priority) {
        if (!StringUtils.hasText(priority)) return Enums.Priority.medium;
        return Enums.Priority.valueOf(priority);
    }

    private String generateRequestNumber() {
        long count = requestRepository.count() + 2401;
        return "REQ-" + count;
    }
}
