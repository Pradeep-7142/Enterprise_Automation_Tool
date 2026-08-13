# FlowDesk Role-Based Access Control (RBAC) & Permissions Guide

This document outlines the security architecture, role definitions, feature access matrix, and workflows for every user role in **FlowDesk**.

---

## 1. System Roles Overview

FlowDesk enforces a multi-tier Role-Based Access Control (RBAC) model implemented with Spring Security `@PreAuthorize` guards on the backend and dynamic navigation rendering on the frontend.

| Role Key | Display Name | Default Test Account | Core Responsibility |
| :--- | :--- | :--- | :--- |
| `SUPER_ADMIN` / `ORG_ADMIN` | Org Admin / Super Admin | `alex@acme.com` | Enterprise governance, user lifecycle management, organizational departments, system health, audit logs, and global approval overrides. |
| `DEPARTMENT_HEAD` | Department Head | `sarah.j@acme.com` | Departmental workflow approvals, team task allocations, department budget monitoring, and operational reporting. |
| `MANAGER` | Manager | `marcus.r@acme.com` | Direct reports' request approvals, team task assignments, and department collaboration. |
| `FINANCE` | Finance Director | `david.o@acme.com` | Financial stage approvals (expenses, purchases, budget increases), cost center analytics, and financial reporting. |
| `HR` | HR Lead | `sarah.j@acme.com` | HR workflow approvals (leave, onboarding, relocations), employee directories, and workforce metrics. |
| `AUDITOR` | Compliance Auditor | *(Assignable)* | Compliance auditing, read-only review of security logs, approval trails, and operational analytics. |
| `EMPLOYEE` / `IT` / `SUPPORT` | Employee / Specialist | `elena.k@acme.com` | Creating workflow requests, tracking submission statuses, commenting on request threads, and team messaging. |
| `VIEWER` | Read-Only Viewer | *(Assignable)* | Read-only inspection of dashboards and public schedules. Cannot mutate or submit items. |

---

## 2. Feature & Permission Access Matrix

| Feature / Action | `ORG_ADMIN` | `DEPT_HEAD` | `MANAGER` | `FINANCE` / `HR` | `AUDITOR` | `EMPLOYEE` | `VIEWER` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Admin Console (`/admin`)** | ✅ **Full** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Org Settings & System Health** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **User Governance (Add/Deactivate/Role Change)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Department CRUD (Create/Edit/Delete)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Workflow Builder (Design Workflows)** | ✅ | 👁️ View | 👁️ View | 👁️ View | 👁️ View | 👁️ View | 👁️ View |
| **Audit Logs (`/audit-logs`)** | ✅ | ❌ | ❌ | ❌ | ✅ **Read-Only** | ❌ | ❌ |
| **Approve / Reject Requests** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Existing Requests** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Delete Requests Permanently** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create New Workflow Requests** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Add Comments & Attachments** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Create / Edit Team Tasks** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Delete Files** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Upload Files** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **View Analytics & Reports** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Messages & Direct Chat** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 👁️ |
| **Notifications Feed** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3. Role-by-Role Responsibilities & Workflows

### 👑 1. Org Admin & Super Admin (`alex@acme.com`)
- **What they do**: Manage overall company infrastructure and organization settings.
- **Key Actions**:
  - **Admin Console (`/admin`)**: Monitor live backend health, database connection, Redis metrics, and stats summary.
  - **Organization Settings**: Update company name, primary domain, and default timezone.
  - **User Governance**: Create new employees, promote/demote user roles, and deactivate or reactivate user accounts.
  - **Departments**: Add new organizational departments, configure departmental budget allocations, and archive obsolete units.
  - **Global Request Oversight**: Access all pending approval bottlenecks across any department, approve/reject on behalf of managers, and delete errant requests.
  - **Audit Logs (`/audit-logs`)**: View tamper-proof audit trails for all system actions.

---

### 🏛️ 2. Department Head (`sarah.j@acme.com`, `nina.b@acme.com`, `thomas.w@acme.com`)
- **What they do**: Oversee department operations, staff, and multi-tier approvals.
- **Key Actions**:
  - **Approvals (`/approvals`)**: Review requests originating from or routed to their department (e.g. Budget > $10,000, high-priority hardware, vendor contracts).
  - **Request Edits**: Modify request details, priorities, or categories when reviewing team proposals.
  - **Task Delegation (`/tasks`)**: Create, assign, and manage execution tasks across department members.
  - **Asset Management (`/files`)**: Upload and delete departmental files and documentation.
  - **Analytics & Reports (`/analytics`, `/reports`)**: Monitor throughput, SLA resolution metrics, and department performance.

---

### 👔 3. Manager (`marcus.r@acme.com`, `aisha.p@acme.com`, `lisa.c@acme.com`)
- **What they do**: Supervise direct reports and manage daily operational requests.
- **Key Actions**:
  - **Team Approvals**: Action initial stage approval steps for team members' submissions.
  - **Task Assignments**: Create and assign work tasks in the Task Tracker.
  - **Department Requests**: Submit operational requests on behalf of the team.
  - **Team Collaboration**: Conduct group discussions in Channels and 1:1 Direct Messages.

---

### 💳 4. Finance Director & Specialist (`david.o@acme.com`)
- **What they do**: Govern organizational expenditures, invoice approvals, and budget tracking.
- **Key Actions**:
  - **Financial Approvals**: Action financial checkpoint approvals on capital expenditures, cloud infrastructure budgets, and software licenses.
  - **Financial Analytics**: Review budget utilization graphs and department expenditure breakdowns in Analytics.
  - **Audit Coordination**: Generate structured expenditure and approval reports.

---

### 🔍 5. Auditor
- **What they do**: Provide independent compliance, security, and governance auditing.
- **Key Actions**:
  - **Audit Trail Examination (`/audit-logs`)**: Review chronological logs of user logins, role modifications, request approvals, and data mutations.
  - **Compliance Reports**: Access reports and operational analytics for audit readiness.
  - **Strict Read-Only**: Cannot approve, reject, create, or alter operational requests to maintain segregation of duties.

---

### 👤 6. Employee (`elena.k@acme.com`, `james.m@acme.com`, `carlos.m@acme.com`)
- **What they do**: Core organizational team members driving daily deliverables.
- **Key Actions**:
  - **Submit Requests (`/requests/new`)**: Initiate requests with title, description, priority, and department routing.
  - **Track Progress (`/requests`)**: View interactive visual approval timelines and status changes (`Pending`, `In Review`, `Approved`, `Rejected`).
  - **Discussion Thread**: Post comments and answer clarifying questions from approvers.
  - **Workplace Communication**: Participate in channels, send direct messages, and receive notification badges.

---

## 4. Verification & Testing Credentials

All accounts can be authenticated at [http://localhost:5173/login](http://localhost:5173/login) using password: **`password123`**

| Role | Email | Password |
| :--- | :--- | :--- |
| **Org Admin** | `alex@acme.com` | `password123` |
| **Department Head (Eng)** | `sarah.j@acme.com` | `password123` |
| **Department Head (Legal)** | `nina.b@acme.com` | `password123` |
| **Manager (Product)** | `marcus.r@acme.com` | `password123` |
| **Finance Director** | `david.o@acme.com` | `password123` |
| **Employee (Data Science)**| `elena.k@acme.com` | `password123` |
| **Employee (DevOps)** | `james.m@acme.com` | `password123` |
