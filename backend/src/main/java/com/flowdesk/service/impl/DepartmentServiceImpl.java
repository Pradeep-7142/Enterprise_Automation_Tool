package com.flowdesk.service.impl;

import com.flowdesk.dto.response.DepartmentDto;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.exception.ResourceNotFoundException;
import com.flowdesk.mapper.DepartmentMapper;
import com.flowdesk.repository.DepartmentRepository;
import com.flowdesk.service.DepartmentService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class DepartmentServiceImpl implements DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository, DepartmentMapper departmentMapper) {
        this.departmentRepository = departmentRepository;
        this.departmentMapper = departmentMapper;
    }

    @Override
    @Cacheable("departments")
    public List<DepartmentDto> listAll() {
        User user = requireUser();
        return departmentMapper.toDtoList(
                departmentRepository.findByOrganizationIdAndDeletedFalseOrderByNameAsc(user.getOrganization().getId()));
    }

    @Override
    public DepartmentDto getByDisplayId(Integer displayId) {
        return departmentMapper.toDto(departmentRepository.findByDisplayIdAndDeletedFalse(displayId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found")));
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
