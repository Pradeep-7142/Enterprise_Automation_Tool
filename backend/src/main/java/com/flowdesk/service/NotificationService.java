package com.flowdesk.service;

import com.flowdesk.dto.response.NotificationDto;
import java.util.List;

public interface NotificationService {
    List<NotificationDto> listAll();
    List<NotificationDto> listUnread();
    long unreadCount();
    NotificationDto markRead(Integer displayId);
    void markAllRead();
}
