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

    @Override
    @Transactional
    public DepartmentDto create(java.util.Map<String, Object> body) {
        User user = requireUser();
        com.flowdesk.entity.Department d = new com.flowdesk.entity.Department();
        d.setOrganization(user.getOrganization());
        d.setName(body.getOrDefault("name", "New Department").toString());
        d.setBudget(body.containsKey("budget") && body.get("budget") != null ? body.get("budget").toString() : "$0");
        d.setColor(body.containsKey("color") && body.get("color") != null ? body.get("color").toString() : "#2563eb");
        d.setDisplayId(departmentRepository.findMaxDisplayId() + 1);
        d.setMembers(0);
        d.setRequestCount(0);
        d.setPerformance(100);
        return departmentMapper.toDto(departmentRepository.save(d));
    }

    @Override
    @Transactional
    public DepartmentDto update(Integer displayId, java.util.Map<String, Object> body) {
        com.flowdesk.entity.Department d = departmentRepository.findByDisplayIdAndDeletedFalse(displayId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        if (body.containsKey("name") && body.get("name") != null) d.setName(body.get("name").toString());
        if (body.containsKey("budget") && body.get("budget") != null) d.setBudget(body.get("budget").toString());
        if (body.containsKey("color") && body.get("color") != null) d.setColor(body.get("color").toString());
        return departmentMapper.toDto(departmentRepository.save(d));
    }

    @Override
    @Transactional
    public void delete(Integer displayId) {
        com.flowdesk.entity.Department d = departmentRepository.findByDisplayIdAndDeletedFalse(displayId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        d.setDeleted(true);
        departmentRepository.save(d);
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
