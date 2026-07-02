package com.flowdesk.service.impl;

import com.flowdesk.dto.response.*;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.mapper.*;
import com.flowdesk.repository.*;
import com.flowdesk.service.SearchService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SearchServiceImpl implements SearchService {
    private final UserRepository userRepository;
    private final WorkflowRequestRepository requestRepository;
    private final FileMetadataRepository fileMetadataRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeMapper employeeMapper;
    private final RequestMapper requestMapper;
    private final FileMapper fileMapper;
    private final DepartmentMapper departmentMapper;

    public SearchServiceImpl(UserRepository userRepository, WorkflowRequestRepository requestRepository,
                           FileMetadataRepository fileMetadataRepository, DepartmentRepository departmentRepository,
                           EmployeeMapper employeeMapper, RequestMapper requestMapper,
                           FileMapper fileMapper, DepartmentMapper departmentMapper) {
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.fileMetadataRepository = fileMetadataRepository;
        this.departmentRepository = departmentRepository;
        this.employeeMapper = employeeMapper;
        this.requestMapper = requestMapper;
        this.fileMapper = fileMapper;
        this.departmentMapper = departmentMapper;
    }

    @Override
    public SearchResultDto search(String q, int page, int limit) {
        User user = requireUser();
        var orgId = user.getOrganization().getId();
        var employees = employeeMapper.toDtoList(userRepository.search(orgId, q, PageRequest.of(0, limit)).getContent());
        var requests = requestMapper.toDtoList(requestRepository.search(orgId, q, PageRequest.of(0, limit)).getContent());
        var files = fileMapper.toDtoList(fileMetadataRepository.search(orgId, q));
        var departments = departmentMapper.toDtoList(departmentRepository.searchByName(q));
        long total = employees.size() + requests.size() + files.size() + departments.size();
        return SearchResultDto.builder().employees(employees.stream().map(e -> java.util.Map.<String, Object>of(
                "id", e.getId(), "name", e.getName(), "dept", e.getDept(), "email", e.getEmail())).toList())
                .requests(requests).files(files).departments(departments).total(total).build();
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
