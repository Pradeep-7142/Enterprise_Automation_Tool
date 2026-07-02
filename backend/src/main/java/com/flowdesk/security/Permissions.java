package com.flowdesk.security;

/**
 * Central role/permission expressions used by {@code @PreAuthorize}.
 * Roles map to Spring Security authorities as {@code ROLE_<name>}, so the
 * {@code hasAnyRole(...)} expressions below refer to {@link com.flowdesk.constant.Enums.SystemRole} values.
 *
 * <p>Permission matrix:
 * <ul>
 *   <li><b>Admin</b> (org configuration, members, admin console): SUPER_ADMIN, ORG_ADMIN</li>
 *   <li><b>Approver</b> (approve/reject requests, create reports): + DEPARTMENT_HEAD, MANAGER, FINANCE, HR</li>
 *   <li><b>Request editor</b> (update existing requests): SUPER_ADMIN, ORG_ADMIN, DEPARTMENT_HEAD, MANAGER</li>
 *   <li><b>Contributor</b> (create requests, upload files): everyone except read-only VIEWER and AUDITOR</li>
 *   <li><b>Audit viewer</b> (audit logs): SUPER_ADMIN, ORG_ADMIN, AUDITOR</li>
 *   <li><b>File remover</b> (delete files): SUPER_ADMIN, ORG_ADMIN, DEPARTMENT_HEAD</li>
 * </ul>
 */
public final class Permissions {
    private Permissions() {}

    public static final String ADMIN =
            "hasAnyRole('SUPER_ADMIN','ORG_ADMIN')";

    public static final String APPROVER =
            "hasAnyRole('SUPER_ADMIN','ORG_ADMIN','DEPARTMENT_HEAD','MANAGER','FINANCE','HR')";

    public static final String REQUEST_EDITOR =
            "hasAnyRole('SUPER_ADMIN','ORG_ADMIN','DEPARTMENT_HEAD','MANAGER')";

    public static final String CONTRIBUTOR =
            "hasAnyRole('SUPER_ADMIN','ORG_ADMIN','DEPARTMENT_HEAD','MANAGER','EMPLOYEE','FINANCE','HR','IT','SUPPORT')";

    public static final String AUDIT_VIEWER =
            "hasAnyRole('SUPER_ADMIN','ORG_ADMIN','AUDITOR')";

    public static final String FILE_REMOVER =
            "hasAnyRole('SUPER_ADMIN','ORG_ADMIN','DEPARTMENT_HEAD')";
}
