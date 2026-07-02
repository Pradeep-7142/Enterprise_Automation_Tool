package com.flowdesk.service.impl;

import com.flowdesk.constant.Enums;
import com.flowdesk.dto.request.CreateEmployeeRequest;
import com.flowdesk.dto.response.EmployeeDto;
import com.flowdesk.dto.response.PageResponse;
import com.flowdesk.entity.Role;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.exception.ResourceNotFoundException;
import com.flowdesk.mapper.EmployeeMapper;
import com.flowdesk.repository.DepartmentRepository;
import com.flowdesk.repository.RoleRepository;
import com.flowdesk.repository.UserRepository;
import com.flowdesk.service.UserService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeMapper employeeMapper;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository,
                           DepartmentRepository departmentRepository, PasswordEncoder passwordEncoder,
                           EmployeeMapper employeeMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
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

    @Override
    @Transactional
    public EmployeeDto createEmployee(CreateEmployeeRequest request) {
        User current = requireUser();
        Enums.SystemRole currentRole = current.getRole() != null ? current.getRole().getName() : null;
        if (currentRole != Enums.SystemRole.ORG_ADMIN && currentRole != Enums.SystemRole.SUPER_ADMIN) {
            throw new BusinessException("Only administrators can add members", HttpStatus.FORBIDDEN);
        }
        if (userRepository.findByEmailAndDeletedFalse(request.getEmail()).isPresent()) {
            throw new BusinessException("Email already registered", HttpStatus.CONFLICT);
        }

        Enums.SystemRole parsedRole = Enums.SystemRole.EMPLOYEE;
        if (StringUtils.hasText(request.getRole())) {
            try {
                parsedRole = Enums.SystemRole.valueOf(request.getRole());
            } catch (IllegalArgumentException ex) {
                throw new BusinessException("Invalid role: " + request.getRole(), HttpStatus.BAD_REQUEST);
            }
        }
        final Enums.SystemRole roleName = parsedRole;
        Role role = roleRepository.findByNameAndDeletedFalse(roleName)
                .orElseThrow(() -> new BusinessException("Role not configured: " + roleName, HttpStatus.BAD_REQUEST));

        User user = new User();
        user.setOrganization(current.getOrganization());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setJobTitle(StringUtils.hasText(request.getJobTitle()) ? request.getJobTitle() : roleName.name());
        user.setRole(role);
        user.setPhone(request.getPhone());
        user.setLocation(request.getLocation());
        user.setStatus(Enums.PresenceStatus.offline);
        user.setJoinDate(LocalDate.now());
        user.setEmailVerified(true);
        user.setActive(true);
        user.setDisplayId(userRepository.findMaxDisplayId() + 1);
        String initials = ("" + request.getFirstName().charAt(0) + request.getLastName().charAt(0)).toUpperCase();
        user.setAvatar(initials);
        if (StringUtils.hasText(request.getDept())) {
            departmentRepository.findByNameAndOrganizationIdAndDeletedFalse(request.getDept(), current.getOrganization().getId())
                    .ifPresent(user::setDepartment);
        }
        return employeeMapper.toDto(userRepository.save(user));
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
