package com.flowdesk.service.impl;

import com.flowdesk.dto.response.WorkflowDto;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.exception.ResourceNotFoundException;
import com.flowdesk.mapper.WorkflowMapper;
import com.flowdesk.repository.WorkflowTemplateRepository;
import com.flowdesk.service.WorkflowService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class WorkflowServiceImpl implements WorkflowService {
    private final WorkflowTemplateRepository workflowTemplateRepository;
    private final WorkflowMapper workflowMapper;

    public WorkflowServiceImpl(WorkflowTemplateRepository workflowTemplateRepository, WorkflowMapper workflowMapper) {
        this.workflowTemplateRepository = workflowTemplateRepository;
        this.workflowMapper = workflowMapper;
    }

    @Override
    @Cacheable("workflows")
    public List<WorkflowDto> listAll() {
        return workflowMapper.toDtoList(workflowTemplateRepository
                .findByOrganizationIdAndDeletedFalseOrderByNameAsc(requireUser().getOrganization().getId()));
    }

    @Override
    public WorkflowDto getById(UUID id) {
        return workflowMapper.toDto(workflowTemplateRepository.findById(id)
                .filter(w -> !w.isDeleted()).orElseThrow(() -> new ResourceNotFoundException("Workflow not found")));
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
