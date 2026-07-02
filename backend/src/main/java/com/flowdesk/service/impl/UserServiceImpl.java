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

    @Override
    @Transactional
    public void importEmployees(org.springframework.web.multipart.MultipartFile file) {
        User current = requireUser();
        Enums.SystemRole currentRole = current.getRole() != null ? current.getRole().getName() : null;
        if (currentRole != Enums.SystemRole.ORG_ADMIN && currentRole != Enums.SystemRole.SUPER_ADMIN) {
            throw new BusinessException("Only administrators can import members", HttpStatus.FORBIDDEN);
        }
        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new BusinessException("Empty CSV file", HttpStatus.BAD_REQUEST);
            }
            String[] headers = headerLine.split(",");
            int emailIdx = -1, firstIdx = -1, lastIdx = -1, titleIdx = -1, deptIdx = -1, roleIdx = -1;
            for (int i = 0; i < headers.length; i++) {
                String h = headers[i].trim().toLowerCase();
                if (h.contains("email")) emailIdx = i;
                else if (h.contains("first")) firstIdx = i;
                else if (h.contains("last")) lastIdx = i;
                else if (h.contains("title") || h.contains("job")) titleIdx = i;
                else if (h.contains("dept") || h.contains("department")) deptIdx = i;
                else if (h.contains("role")) roleIdx = i;
            }
            if (emailIdx == -1 || firstIdx == -1 || lastIdx == -1) {
                throw new BusinessException("CSV must contain Email, First Name, and Last Name columns", HttpStatus.BAD_REQUEST);
            }

            String line;
            int maxId = userRepository.findMaxDisplayId();
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] values = line.split(",");
                if (values.length <= Math.max(emailIdx, Math.max(firstIdx, lastIdx))) continue;

                String email = values[emailIdx].trim();
                if (userRepository.findByEmailAndDeletedFalse(email).isPresent()) {
                    continue; 
                }
                String first = values[firstIdx].trim();
                String last = values[lastIdx].trim();
                String title = titleIdx != -1 && values.length > titleIdx ? values[titleIdx].trim() : "Employee";
                String deptName = deptIdx != -1 && values.length > deptIdx ? values[deptIdx].trim() : "";
                String roleStr = roleIdx != -1 && values.length > roleIdx ? values[roleIdx].trim() : "EMPLOYEE";

                Enums.SystemRole parsedRole = Enums.SystemRole.EMPLOYEE;
                try {
                    parsedRole = Enums.SystemRole.valueOf(roleStr.toUpperCase());
                } catch (Exception ignored) {}

                final Enums.SystemRole roleName = parsedRole;
                Role role = roleRepository.findByNameAndDeletedFalse(roleName)
                        .orElseGet(() -> {
                            Role r = new Role();
                            r.setName(roleName);
                            r.setDescription(roleName.name());
                            return roleRepository.save(r);
                        });

                User user = new User();
                user.setOrganization(current.getOrganization());
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode("WelcomePassword123!"));
                user.setFirstName(first);
                user.setLastName(last);
                user.setJobTitle(title);
                user.setRole(role);
                user.setStatus(Enums.PresenceStatus.offline);
                user.setJoinDate(LocalDate.now());
                user.setEmailVerified(false);
                user.setActive(true);
                user.setDisplayId(++maxId);
                String initials = ("" + first.charAt(0) + last.charAt(0)).toUpperCase();
                user.setAvatar(initials);

                if (StringUtils.hasText(deptName)) {
                    com.flowdesk.entity.Department dept = departmentRepository
                            .findByNameAndOrganizationIdAndDeletedFalse(deptName, current.getOrganization().getId())
                            .orElseGet(() -> {
                                com.flowdesk.entity.Department d = new com.flowdesk.entity.Department();
                                d.setName(deptName);
                                d.setOrganization(current.getOrganization());
                                d.setBudget("$0");
                                d.setMembers(0);
                                d.setRequestCount(0);
                                d.setPerformance(100);
                                d.setColor("#2563eb");
                                return departmentRepository.save(d);
                            });
                    dept.setMembers(dept.getMembers() + 1);
                    departmentRepository.save(dept);
                    user.setDepartment(dept);
                }
                userRepository.save(user);
            }
        } catch (java.io.IOException e) {
            throw new BusinessException("Failed to read CSV file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}

