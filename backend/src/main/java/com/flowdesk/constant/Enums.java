package com.flowdesk.constant;

public final class Enums {
    private Enums() {}

    public enum RequestStatus { pending, in_review, approved, rejected, draft, cancelled }
    public enum Priority { critical, high, medium, low }
    public enum PresenceStatus { online, busy, offline }
    public enum NotificationType { approval, mention, assignment, deadline, system }
    public enum AuditLogType { approval, rejection, create, comment, file, admin, system }
    public enum FileType { folder, pdf, xlsx, image, doc }
    public enum ConversationType { direct, group }
    public enum WorkflowNodeType { start, approval, decision, notification, task, delay, api, end }
    public enum WorkflowStatus { Saved, Published }
    public enum OrgRole { Admin, Member, Viewer }
    public enum SystemRole { SUPER_ADMIN, ORG_ADMIN, DEPARTMENT_HEAD, MANAGER, EMPLOYEE, FINANCE, HR, IT, AUDITOR, VIEWER, SUPPORT }
    public enum ReportStatus { ready, scheduled }
    public enum HealthStatus { healthy, warning }
    public enum ApprovalStepStatus { Approved, Pending, Waiting, Rejected }
}
