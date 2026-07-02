package com.flowdesk.controller;

import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.dto.response.NotificationDto;
import com.flowdesk.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> list(@RequestParam(required = false) Boolean unread) {
        if (Boolean.TRUE.equals(unread)) {
            return ResponseEntity.ok(ApiResponse.ok(notificationService.listUnread()));
        }
        return ResponseEntity.ok(ApiResponse.ok(notificationService.listAll()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of("count", notificationService.unreadCount())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDto>> markRead(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.markRead(id)));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked read", null));
    }
}
