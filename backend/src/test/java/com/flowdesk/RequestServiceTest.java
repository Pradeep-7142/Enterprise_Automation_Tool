package com.flowdesk;

import com.flowdesk.dto.response.RequestDto;
import com.flowdesk.entity.Organization;
import com.flowdesk.entity.User;
import com.flowdesk.entity.WorkflowRequest;
import com.flowdesk.constant.Enums;
import com.flowdesk.mapper.RequestMapper;
import com.flowdesk.repository.WorkflowRequestRepository;
import com.flowdesk.service.RequestService;
import com.flowdesk.service.impl.RequestServiceImpl;
import com.flowdesk.repository.DepartmentRepository;
import com.flowdesk.repository.UserRepository;
import com.flowdesk.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RequestServiceTest {

    @Mock
    private WorkflowRequestRepository requestRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RequestMapper requestMapper;
    @Mock
    private AuditService auditService;

    private RequestService requestService;
    private User testUser;
    private WorkflowRequest testRequest;

    @BeforeEach
    void setUp() {
        requestService = new RequestServiceImpl(requestRepository, departmentRepository,
                userRepository, requestMapper, auditService);

        Organization org = new Organization();
        org.setId(UUID.randomUUID());
        org.setName("Acme Corp");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("alex@acme.com");
        testUser.setFirstName("Alex");
        testUser.setLastName("Thompson");
        testUser.setOrganization(org);

        testRequest = new WorkflowRequest();
        testRequest.setId(UUID.randomUUID());
        testRequest.setRequestNumber("REQ-2401");
        testRequest.setTitle("IT Equipment Procurement");
        testRequest.setStatus(Enums.RequestStatus.in_review);
        testRequest.setPriority(Enums.Priority.high);
        testRequest.setOrganization(org);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(testUser, null));
    }

    @Test
    void getByRequestNumber_returnsMappedDto() {
        RequestDto dto = RequestDto.builder()
                .id("REQ-2401")
                .title("IT Equipment Procurement")
                .status("in_review")
                .priority("high")
                .build();

        when(requestRepository.findByRequestNumberAndDeletedFalse("REQ-2401"))
                .thenReturn(Optional.of(testRequest));
        when(requestMapper.toDto(testRequest)).thenReturn(dto);

        RequestDto result = requestService.getByRequestNumber("REQ-2401");

        assertThat(result.getId()).isEqualTo("REQ-2401");
        assertThat(result.getTitle()).isEqualTo("IT Equipment Procurement");
        assertThat(result.getStatus()).isEqualTo("in_review");
    }

    @Test
    void approve_updatesStatusToApproved() {
        when(requestRepository.findByRequestNumberAndDeletedFalse("REQ-2401"))
                .thenReturn(Optional.of(testRequest));
        when(requestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(requestMapper.toDto(any())).thenReturn(RequestDto.builder()
                .id("REQ-2401").status("approved").step("Completed").build());

        RequestDto result = requestService.approve("REQ-2401", new com.flowdesk.dto.request.ApprovalActionRequest());

        assertThat(result.getStatus()).isEqualTo("approved");
        assertThat(testRequest.getStatus()).isEqualTo(Enums.RequestStatus.approved);
        assertThat(testRequest.getCurrentStep()).isEqualTo("Completed");
    }
}
