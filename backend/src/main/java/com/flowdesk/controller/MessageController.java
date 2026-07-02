package com.flowdesk.controller;

import com.flowdesk.dto.request.SendMessageRequest;
import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.dto.response.ChatMessageDto;
import com.flowdesk.dto.response.ConversationDto;
import com.flowdesk.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationDto>>> conversations() {
        return ResponseEntity.ok(ApiResponse.ok(messageService.listConversations()));
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse<List<ChatMessageDto>>> messages(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.getMessages(id)));
    }

    @PostMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse<ChatMessageDto>> send(@PathVariable Integer id,
                                                            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.sendMessage(id, request)));
    }

    @PostMapping("/conversations/direct/{employeeId}")
    public ResponseEntity<ApiResponse<ConversationDto>> startDirect(@PathVariable Integer employeeId) {
        return ResponseEntity.ok(ApiResponse.ok("Conversation ready", messageService.startDirectConversation(employeeId)));
    }
}
