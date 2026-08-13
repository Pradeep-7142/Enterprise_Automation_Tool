package com.flowdesk.dto.request;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String currentPassword;
    private String oldPassword;
    private String current;
    private String newPassword;
    private String next;

    public String resolveCurrentPassword() {
        if (currentPassword != null && !currentPassword.isBlank()) return currentPassword;
        if (oldPassword != null && !oldPassword.isBlank()) return oldPassword;
        return current != null ? current : "";
    }

    public String resolveNewPassword() {
        if (newPassword != null && !newPassword.isBlank()) return newPassword;
        return next != null ? next : "";
    }
}
