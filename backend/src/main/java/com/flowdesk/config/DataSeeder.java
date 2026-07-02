package com.flowdesk.config;

import com.flowdesk.constant.Enums;
import com.flowdesk.entity.*;
import com.flowdesk.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@Slf4j
@Component
public class DataSeeder implements CommandLineRunner {

    private final FlowDeskProperties properties;
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final WorkflowRequestRepository requestRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final FileMetadataRepository fileMetadataRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ConversationParticipantRepository participantRepository;
    private final WorkflowTemplateRepository workflowTemplateRepository;
    private final WorkflowNodeRepository workflowNodeRepository;
    private final WorkflowEdgeRepository workflowEdgeRepository;
    private final ReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(FlowDeskProperties properties,
                      OrganizationRepository organizationRepository,
                      RoleRepository roleRepository,
                      DepartmentRepository departmentRepository,
                      UserRepository userRepository,
                      UserSkillRepository userSkillRepository,
                      WorkflowRequestRepository requestRepository,
                      NotificationRepository notificationRepository,
                      AuditLogRepository auditLogRepository,
                      FileMetadataRepository fileMetadataRepository,
                      ConversationRepository conversationRepository,
                      MessageRepository messageRepository,
                      ConversationParticipantRepository participantRepository,
                      WorkflowTemplateRepository workflowTemplateRepository,
                      WorkflowNodeRepository workflowNodeRepository,
                      WorkflowEdgeRepository workflowEdgeRepository,
                      ReportRepository reportRepository,
                      PasswordEncoder passwordEncoder) {
        this.properties = properties;
        this.organizationRepository = organizationRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.requestRepository = requestRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.fileMetadataRepository = fileMetadataRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.participantRepository = participantRepository;
        this.workflowTemplateRepository = workflowTemplateRepository;
        this.workflowNodeRepository = workflowNodeRepository;
        this.workflowEdgeRepository = workflowEdgeRepository;
        this.reportRepository = reportRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedRolesIfMissing();
        if (!properties.isSeedData()) {
            return;
        }
        if (organizationRepository.count() > 0) {
            log.info("Seed data already present, skipping");
            return;
        }
        log.info("Seeding FlowDesk demo data...");
        Organization org = seedOrganization();
        Map<Enums.SystemRole, Role> roles = getSystemRolesMap();
        Map<String, Department> departments = seedDepartments(org);
        Map<String, User> users = seedUsers(org, roles, departments);
        linkDepartmentHeads(departments, users);
        seedRequests(org, departments, users);
        seedNotifications(users.get("alex@acme.com"));
        seedAuditLogs(org, users);
        seedFiles(org, users.get("alex@acme.com"));
        seedConversations(org, users);
        seedWorkflowTemplate(org);
        seedReports(org, users.get("alex@acme.com"));
        log.info("Seed data complete. Default login: alex@acme.com / password123");
    }

    private void seedRolesIfMissing() {
        for (Enums.SystemRole sr : Enums.SystemRole.values()) {
            if (roleRepository.findByNameAndDeletedFalse(sr).isEmpty()) {
                Role role = new Role();
                role.setName(sr);
                role.setDescription(sr.name());
                roleRepository.save(role);
            }
        }
    }

    private Map<Enums.SystemRole, Role> getSystemRolesMap() {
        Map<Enums.SystemRole, Role> roles = new EnumMap<>(Enums.SystemRole.class);
        for (Enums.SystemRole sr : Enums.SystemRole.values()) {
            roleRepository.findByNameAndDeletedFalse(sr).ifPresent(r -> roles.put(sr, r));
        }
        return roles;
    }

    private Organization seedOrganization() {
        Organization org = new Organization();
        org.setName("Acme Corp");
        org.setSlug("acme");
        org.setDescription("Enterprise Workflow Automation");
        return organizationRepository.save(org);
    }



    private Map<String, Department> seedDepartments(Organization org) {
        String[][] data = {
                {"1", "Engineering", "42", "156", "$2.4M", "94", "#2563eb"},
                {"2", "Product", "18", "89", "$890K", "88", "#7c3aed"},
                {"3", "Design", "12", "45", "$560K", "92", "#0891b2"},
                {"4", "Sales", "28", "72", "$1.8M", "86", "#059669"},
                {"5", "Finance", "15", "134", "$680K", "91", "#d97706"},
                {"6", "Marketing", "20", "98", "$1.2M", "79", "#db2777"},
                {"7", "Legal", "8", "211", "$920K", "97", "#dc2626"},
                {"8", "HR", "10", "187", "$540K", "90", "#0d9488"},
                {"9", "IT", "14", "120", "$1.1M", "93", "#6366f1"},
                {"10", "Facilities", "6", "55", "$420K", "85", "#78716c"},
                {"11", "Support", "9", "67", "$380K", "87", "#14b8a6"}
        };
        Map<String, Department> map = new LinkedHashMap<>();
        for (String[] d : data) {
            Department dept = new Department();
            dept.setDisplayId(Integer.parseInt(d[0]));
            dept.setOrganization(org);
            dept.setName(d[1]);
            dept.setMembers(Integer.parseInt(d[2]));
            dept.setRequestCount(Integer.parseInt(d[3]));
            dept.setBudget(d[4]);
            dept.setPerformance(Integer.parseInt(d[5]));
            dept.setColor(d[6]);
            map.put(d[1], departmentRepository.save(dept));
        }
        return map;
    }

    private Map<String, User> seedUsers(Organization org, Map<Enums.SystemRole, Role> roles, Map<String, Department> departments) {
        Object[][] employees = {
                {"alex@acme.com", "Alex", "Thompson", "Platform Admin", "Engineering", "AT", 0, "online", "2020-01-01", Enums.SystemRole.ORG_ADMIN,
                        "+1 (555) 000-0001", "San Francisco, CA", new String[]{}},
                {"sarah.j@acme.com", "Sarah", "Johnson", "VP of Engineering", "Engineering", "SJ", 18, "online", "2020-03-15", Enums.SystemRole.DEPARTMENT_HEAD,
                        "+1 (555) 123-4567", "San Francisco, CA", new String[]{"System Design", "Team Leadership", "Go", "Kubernetes"}},
                {"marcus.r@acme.com", "Marcus", "Rodriguez", "Sr. Product Manager", "Product", "MR", 5, "online", "2021-06-01", Enums.SystemRole.MANAGER,
                        "+1 (555) 234-5678", "New York, NY", new String[]{"Product Strategy", "Data Analysis", "Agile", "SQL"}},
                {"aisha.p@acme.com", "Aisha", "Patel", "UX Design Lead", "Design", "AP", 6, "busy", "2021-09-20", Enums.SystemRole.MANAGER,
                        "+1 (555) 345-6789", "Austin, TX", new String[]{"Figma", "User Research", "Prototyping", "Design Systems"}},
                {"thomas.w@acme.com", "Thomas", "Wu", "Head of Sales", "Sales", "TW", 12, "offline", "2019-11-05", Enums.SystemRole.DEPARTMENT_HEAD,
                        "+1 (555) 456-7890", "Chicago, IL", new String[]{"B2B Sales", "CRM", "Account Mgmt", "Negotiation"}},
                {"elena.k@acme.com", "Elena", "Kowalski", "Data Scientist", "Engineering", "EK", 0, "online", "2022-02-14", Enums.SystemRole.EMPLOYEE,
                        "+1 (555) 567-8901", "Seattle, WA", new String[]{"Python", "Machine Learning", "TensorFlow", "Statistics"}},
                {"david.o@acme.com", "David", "Okafor", "Finance Director", "Finance", "DO", 8, "online", "2020-07-22", Enums.SystemRole.FINANCE,
                        "+1 (555) 678-9012", "Boston, MA", new String[]{"Financial Modeling", "GAAP", "Excel", "SAP"}},
                {"lisa.c@acme.com", "Lisa", "Chang", "Marketing Manager", "Marketing", "LC", 4, "busy", "2021-04-10", Enums.SystemRole.MANAGER,
                        "+1 (555) 789-0123", "Los Angeles, CA", new String[]{"Digital Marketing", "SEO", "HubSpot", "Content Strategy"}},
                {"james.m@acme.com", "James", "Mitchell", "DevOps Engineer", "Engineering", "JM", 0, "online", "2022-08-01", Enums.SystemRole.EMPLOYEE,
                        "+1 (555) 890-1234", "Denver, CO", new String[]{"AWS", "Docker", "Terraform", "CI/CD"}},
                {"nina.b@acme.com", "Nina", "Berger", "Legal Counsel", "Legal", "NB", 3, "busy", "2020-01-20", Enums.SystemRole.DEPARTMENT_HEAD,
                        "+1 (555) 901-2345", "Washington, DC", new String[]{"Corporate Law", "Compliance", "M&A", "IP"}},
                {"carlos.m@acme.com", "Carlos", "Mendez", "Customer Success", "Support", "CM", 0, "online", "2022-05-15", Enums.SystemRole.EMPLOYEE,
                        "+1 (555) 012-3456", "Miami, FL", new String[]{"CRM", "Onboarding", "SLA Mgmt", "Zendesk"}},
                {"priya.s@acme.com", "Priya", "Sharma", "Backend Engineer", "Engineering", "PS", 0, "online", "2023-01-10", Enums.SystemRole.EMPLOYEE,
                        "+1 (555) 111-2222", "San Jose, CA", new String[]{"Node.js", "PostgreSQL", "Redis", "Microservices"}},
                {"omar.h@acme.com", "Omar", "Hassan", "Security Engineer", "IT", "OH", 2, "offline", "2021-11-30", Enums.SystemRole.EMPLOYEE,
                        "+1 (555) 333-4444", "Dallas, TX", new String[]{"Cybersecurity", "SIEM", "Pen Testing", "Compliance"}}
        };
        Map<String, User> users = new LinkedHashMap<>();
        int displayId = 1;
        String encodedPassword = passwordEncoder.encode("password123");
        for (Object[] e : employees) {
            User user = new User();
            user.setDisplayId(displayId++);
            user.setEmail((String) e[0]);
            user.setPassword(encodedPassword);
            user.setFirstName((String) e[1]);
            user.setLastName((String) e[2]);
            user.setJobTitle((String) e[3]);
            user.setDepartment(departments.get(e[4]));
            user.setAvatar((String) e[5]);
            user.setDirectReports((Integer) e[6]);
            user.setStatus(Enums.PresenceStatus.valueOf((String) e[7]));
            user.setJoinDate(LocalDate.parse((String) e[8]));
            user.setRole(roles.get(e[9]));
            user.setPhone((String) e[10]);
            user.setLocation((String) e[11]);
            user.setOrganization(org);
            user.setEmailVerified(true);
            user.setActive(true);
            user = userRepository.save(user);
            for (String skill : (String[]) e[12]) {
                UserSkill us = new UserSkill();
                us.setUser(user);
                us.setSkill(skill);
                userSkillRepository.save(us);
            }
            users.put(user.getEmail(), user);
        }
        users.get("sarah.j@acme.com").setManager(users.get("alex@acme.com"));
        users.get("marcus.r@acme.com").setManager(users.get("alex@acme.com"));
        users.get("elena.k@acme.com").setManager(users.get("sarah.j@acme.com"));
        users.get("james.m@acme.com").setManager(users.get("sarah.j@acme.com"));
        users.get("priya.s@acme.com").setManager(users.get("sarah.j@acme.com"));
        users.get("omar.h@acme.com").setManager(users.get("sarah.j@acme.com"));
        userRepository.saveAll(users.values());
        return users;
    }

    private void linkDepartmentHeads(Map<String, Department> departments, Map<String, User> users) {
        departments.get("Engineering").setHead(users.get("sarah.j@acme.com"));
        departments.get("Product").setHead(users.get("marcus.r@acme.com"));
        departments.get("Design").setHead(users.get("aisha.p@acme.com"));
        departments.get("Sales").setHead(users.get("thomas.w@acme.com"));
        departments.get("Finance").setHead(users.get("david.o@acme.com"));
        departments.get("Marketing").setHead(users.get("lisa.c@acme.com"));
        departments.get("Legal").setHead(users.get("nina.b@acme.com"));
        departments.get("HR").setHead(users.get("sarah.j@acme.com"));
        departmentRepository.saveAll(departments.values());
    }

    private void seedRequests(Organization org, Map<String, Department> departments, Map<String, User> users) {
        String[][] requests = {
                {"REQ-2401", "IT Equipment Procurement", "Engineering", "high", "in_review", "Alice Chen", "Manager Approval", "2024-01-15", "2024-01-16", "Procurement"},
                {"REQ-2402", "Office Renovation Budget", "Facilities", "medium", "pending", "Bob Martinez", "CFO Approval", "2024-01-14", "2024-01-15", "Facilities"},
                {"REQ-2403", "New Employee Onboarding", "HR", "high", "approved", "Carol Lee", "Completed", "2024-01-13", "2024-01-16", "HR"},
                {"REQ-2404", "Marketing Campaign Budget", "Marketing", "medium", "in_review", "David Kim", "Director Approval", "2024-01-12", "2024-01-15", "Finance"},
                {"REQ-2405", "Software License Renewal", "IT", "critical", "pending", "Emma Wilson", "Vendor Verification", "2024-01-11", "2024-01-16", "IT"},
                {"REQ-2406", "Team Building Event", "HR", "low", "approved", "Frank Chen", "Completed", "2024-01-10", "2024-01-14", "HR"},
                {"REQ-2407", "Cloud Infrastructure Upgrade", "IT", "critical", "in_review", "Grace Park", "Technical Review", "2024-01-09", "2024-01-16", "IT"},
                {"REQ-2408", "Legal Document Review", "Legal", "high", "pending", "Henry Johnson", "Legal Review", "2024-01-08", "2024-01-15", "Legal"},
                {"REQ-2409", "Travel Expense Reimbursement", "Finance", "low", "approved", "Iris Zhang", "Completed", "2024-01-07", "2024-01-12", "Finance"},
                {"REQ-2410", "Product Launch Planning", "Marketing", "high", "rejected", "James Brown", "Rejected", "2024-01-06", "2024-01-13", "Marketing"},
                {"REQ-2411", "Data Center Migration", "IT", "critical", "in_review", "Karen Liu", "Risk Assessment", "2024-01-05", "2024-01-16", "IT"},
                {"REQ-2412", "Annual Report Design", "Design", "medium", "draft", "Leo Santos", "Drafting", "2024-01-04", "2024-01-10", "Design"}
        };
        User defaultAssignee = users.get("alex@acme.com");
        for (String[] r : requests) {
            WorkflowRequest req = new WorkflowRequest();
            req.setRequestNumber(r[0]);
            req.setTitle(r[1]);
            req.setDepartment(departments.getOrDefault(r[2], departments.get("Engineering")));
            req.setPriority(Enums.Priority.valueOf(r[3]));
            req.setStatus(Enums.RequestStatus.valueOf(r[4]));
            req.setCurrentStep(r[6]);
            req.setCategory(r[9]);
            req.setOrganization(org);
            req.setRequester(defaultAssignee);
            req.setAssignee(defaultAssignee);
            req.setCreatedAt(LocalDate.parse(r[7]).atStartOfDay().toInstant(ZoneOffset.UTC));
            req.setUpdatedAt(LocalDate.parse(r[8]).atStartOfDay().toInstant(ZoneOffset.UTC));
            requestRepository.save(req);
        }
    }

    private void seedNotifications(User alex) {
        Object[][] data = {
                {1, "approval", "IT Equipment Request approved", "REQ-2403 has been approved by Sarah Johnson", false, "high"},
                {2, "mention", "You were mentioned in a comment", "Alice Chen mentioned you in REQ-2401", false, "medium"},
                {3, "assignment", "New request assigned to you", "REQ-2408 has been assigned to you for review", false, "high"},
                {4, "deadline", "Deadline approaching", "REQ-2407 is due in 24 hours", true, "critical"},
                {5, "approval", "Request rejected", "REQ-2410 was rejected by Finance Director", true, "medium"},
                {6, "system", "System maintenance scheduled", "Planned downtime on Sunday 2:00–4:00 AM UTC", true, "low"},
                {7, "mention", "Comment reply", "Marcus Rodriguez replied to your comment on REQ-2402", true, "low"},
                {8, "assignment", "Workflow template updated", "\"Standard Procurement\" workflow was updated", true, "low"}
        };
        for (Object[] n : data) {
            Notification notif = new Notification();
            notif.setDisplayId((Integer) n[0]);
            notif.setUser(alex);
            notif.setType(Enums.NotificationType.valueOf((String) n[1]));
            notif.setTitle((String) n[2]);
            notif.setDescription((String) n[3]);
            notif.setRead((Boolean) n[4]);
            notif.setPriority(Enums.Priority.valueOf((String) n[5]));
            notificationRepository.save(notif);
        }
    }

    private void seedAuditLogs(Organization org, Map<String, User> users) {
        Object[][] data = {
                {1, "Alice Chen", "Approved", "REQ-2403", "Approved IT equipment request for Engineering team", "2024-01-16 14:32:11", "192.168.1.45", "approval"},
                {2, "System", "Email Sent", "REQ-2401", "Notification email sent to manager for approval", "2024-01-16 13:20:05", "—", "system"},
                {3, "Bob Martinez", "Comment Added", "REQ-2402", "Added comment: \"Budget needs revision per Q4 guidelines\"", "2024-01-16 12:10:47", "10.0.0.23", "comment"},
                {4, "Emma Wilson", "Created", "REQ-2405", "New software license renewal request submitted", "2024-01-16 11:45:33", "10.0.1.112", "create"},
                {5, "Admin", "Role Updated", "User: david.o", "Role changed from Finance Analyst to Finance Director", "2024-01-16 10:30:00", "10.0.0.1", "admin"},
                {6, "Grace Park", "Uploaded File", "REQ-2407", "Added \"Infrastructure_Scope.pdf\" (2.4 MB)", "2024-01-16 09:22:18", "192.168.2.77", "file"},
                {7, "James Brown", "Rejected", "REQ-2410", "Rejected: \"Budget exceeds Q1 allocation by 34%\"", "2024-01-15 17:55:09", "10.0.0.55", "rejection"},
                {8, "System", "Workflow Triggered", "WF-0041", "Standard Approval workflow started for REQ-2411", "2024-01-15 16:40:00", "—", "system"}
        };
        for (Object[] a : data) {
            AuditLog log = new AuditLog();
            log.setDisplayId((Integer) a[0]);
            log.setUserName((String) a[1]);
            log.setAction((String) a[2]);
            log.setResource((String) a[3]);
            log.setDetail((String) a[4]);
            log.setOccurredAt(Instant.parse(((String) a[5]).replace(" ", "T") + "Z"));
            log.setIpAddress((String) a[6]);
            log.setType(Enums.AuditLogType.valueOf((String) a[7]));
            log.setOrganization(org);
            log.setUser(users.get("alex@acme.com"));
            auditLogRepository.save(log);
        }
    }

    private void seedFiles(Organization org, User uploader) {
        Object[][] data = {
                {1, "Q4 Financial Reports", "folder", "—", null, 12, true},
                {2, "Product Roadmap 2024", "folder", "—", null, 8, true},
                {3, "HR Policies v3.0.pdf", "pdf", "2.4 MB", 2516582L, null, false},
                {4, "Engineering Diagrams", "folder", "—", null, 24, true},
                {5, "Brand Guidelines.pdf", "pdf", "8.1 MB", 8493465L, null, true},
                {6, "Procurement Template.xlsx", "xlsx", "156 KB", 159744L, null, false},
                {7, "System Architecture.png", "image", "3.7 MB", 3879731L, null, true},
                {8, "Legal Contracts", "folder", "—", null, 31, false}
        };
        for (Object[] f : data) {
            FileMetadata file = new FileMetadata();
            file.setDisplayId((Integer) f[0]);
            file.setName((String) f[1]);
            file.setType(Enums.FileType.valueOf((String) f[2]));
            file.setSizeLabel((String) f[3]);
            file.setSizeBytes((Long) f[4]);
            file.setItemCount((Integer) f[5]);
            file.setShared((Boolean) f[6]);
            file.setOrganization(org);
            file.setUploadedBy(uploader);
            fileMetadataRepository.save(file);
        }
    }

    private void seedConversations(Organization org, Map<String, User> users) {
        User alex = users.get("alex@acme.com");
        User sarah = users.get("sarah.j@acme.com");
        Conversation c1 = new Conversation();
        c1.setDisplayId(1);
        c1.setName("Sarah Johnson");
        c1.setType(Enums.ConversationType.direct);
        c1.setLastMessage("Can you review REQ-2401?");
        c1.setAvatar("SJ");
        c1.setOrganization(org);
        c1 = conversationRepository.save(c1);

        Message m1 = new Message();
        m1.setDisplayId(1);
        m1.setConversation(c1);
        m1.setSender(sarah);
        m1.setText("Hey Alex, can you review REQ-2401 when you get a chance?");
        m1.setFromSide("them");
        m1.setRead(true);
        messageRepository.save(m1);

        Message m2 = new Message();
        m2.setDisplayId(2);
        m2.setConversation(c1);
        m2.setSender(alex);
        m2.setText("Sure, I'll take a look now.");
        m2.setFromSide("me");
        m2.setRead(true);
        messageRepository.save(m2);

        ConversationParticipant p1 = new ConversationParticipant();
        p1.setConversation(c1);
        p1.setUser(alex);
        p1.setUnreadCount(2);
        p1.setOnline(true);
        participantRepository.save(p1);

        Conversation c2 = new Conversation();
        c2.setDisplayId(2);
        c2.setName("Engineering Team");
        c2.setType(Enums.ConversationType.group);
        c2.setLastMessage("Marcus: Sprint planning at 3pm");
        c2.setAvatar("ET");
        c2.setMemberCount(8);
        c2.setOrganization(org);
        conversationRepository.save(c2);
    }

    private void seedWorkflowTemplate(Organization org) {
        WorkflowTemplate template = new WorkflowTemplate();
        template.setName("Standard Procurement");
        template.setDescription("Default procurement approval workflow");
        template.setStatus(Enums.WorkflowStatus.Published);
        template.setTemplateVersion(1);
        template.setOrganization(org);
        template = workflowTemplateRepository.save(template);

        WorkflowNode start = new WorkflowNode();
        start.setTemplate(template);
        start.setLabel("Start");
        start.setType(Enums.WorkflowNodeType.start);
        start.setPosX(100);
        start.setPosY(100);
        start = workflowNodeRepository.save(start);

        WorkflowNode approval = new WorkflowNode();
        approval.setTemplate(template);
        approval.setLabel("Manager Approval");
        approval.setType(Enums.WorkflowNodeType.approval);
        approval.setPosX(300);
        approval.setPosY(100);
        approval = workflowNodeRepository.save(approval);

        WorkflowNode end = new WorkflowNode();
        end.setTemplate(template);
        end.setLabel("End");
        end.setType(Enums.WorkflowNodeType.end);
        end.setPosX(500);
        end.setPosY(100);
        end = workflowNodeRepository.save(end);

        WorkflowEdge e1 = new WorkflowEdge();
        e1.setTemplate(template);
        e1.setSourceNode(start);
        e1.setTargetNode(approval);
        workflowEdgeRepository.save(e1);

        WorkflowEdge e2 = new WorkflowEdge();
        e2.setTemplate(template);
        e2.setSourceNode(approval);
        e2.setTargetNode(end);
        workflowEdgeRepository.save(e2);
    }

    private void seedReports(Organization org, User creator) {
        Report report = new Report();
        report.setDisplayId(1);
        report.setTitle("Monthly Request Summary");
        report.setType("CSV");
        report.setStatus(Enums.ReportStatus.ready);
        report.setDescription("Summary of all requests by department");
        report.setOrganization(org);
        report.setCreatedByUser(creator);
        reportRepository.save(report);
    }
}
