package com.flowdesk.service.impl;

import com.flowdesk.dto.response.NotificationDto;
import com.flowdesk.entity.Notification;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.exception.ResourceNotFoundException;
import com.flowdesk.mapper.NotificationMapper;
import com.flowdesk.repository.NotificationRepository;
import com.flowdesk.service.NotificationService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(NotificationRepository notificationRepository, NotificationMapper notificationMapper) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
    }

    @Override
    public List<NotificationDto> listAll() {
        return notificationMapper.toDtoList(notificationRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(requireUser().getId()));
    }

    @Override
    public List<NotificationDto> listUnread() {
        return notificationMapper.toDtoList(notificationRepository.findByUserIdAndReadFalseAndDeletedFalseOrderByCreatedAtDesc(requireUser().getId()));
    }

    @Override
    public long unreadCount() {
        return notificationRepository.countByUserIdAndReadFalseAndDeletedFalse(requireUser().getId());
    }

    @Override
    @Transactional
    public NotificationDto markRead(Integer displayId) {
        Notification n = notificationRepository.findAll().stream()
                .filter(x -> !x.isDeleted() && displayId.equals(x.getDisplayId()) && x.getUser().getId().equals(requireUser().getId()))
                .findFirst().orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setRead(true);
        return notificationMapper.toDto(notificationRepository.save(n));
    }

    @Override
    @Transactional
    public void markAllRead() {
        notificationRepository.markAllRead(requireUser().getId());
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
