package com.flowdesk.service.impl;

import com.flowdesk.dto.response.EmployeeDto;
import com.flowdesk.dto.response.PageResponse;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.exception.ResourceNotFoundException;
import com.flowdesk.mapper.EmployeeMapper;
import com.flowdesk.repository.UserRepository;
import com.flowdesk.service.UserService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final EmployeeMapper employeeMapper;

    public UserServiceImpl(UserRepository userRepository, EmployeeMapper employeeMapper) {
        this.userRepository = userRepository;
        this.employeeMapper = employeeMapper;
    }

    @Override
    public PageResponse<EmployeeDto> listEmployees(int page, int limit, String search, String dept) {
        User current = requireUser();
        PageRequest pageable = PageRequest.of(Math.max(page - 1, 0), limit, Sort.by("lastName"));
        Page<User> result = StringUtils.hasText(search)
                ? userRepository.search(current.getOrganization().getId(), search, pageable)
                : userRepository.findByOrganizationIdAndDeletedFalse(current.getOrganization().getId(), pageable);
        var items = employeeMapper.toDtoList(result.getContent());
        if (StringUtils.hasText(dept) && !"all".equalsIgnoreCase(dept)) {
            items = items.stream().filter(e -> dept.equalsIgnoreCase(e.getDept())).toList();
        }
        return PageResponse.<EmployeeDto>builder().items(items).total(result.getTotalElements()).page(page).limit(limit).build();
    }

    @Override
    public EmployeeDto getEmployee(Integer displayId) {
        return employeeMapper.toDto(userRepository.findByDisplayIdAndDeletedFalse(displayId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found")));
    }

    @Override
    public EmployeeDto getEmployeeById(UUID id) {
        return employeeMapper.toDto(userRepository.findById(id)
                .filter(u -> !u.isDeleted()).orElseThrow(() -> new ResourceNotFoundException("Employee not found")));
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
