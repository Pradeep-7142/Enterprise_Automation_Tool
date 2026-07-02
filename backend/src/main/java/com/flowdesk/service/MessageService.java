package com.flowdesk.service;

import com.flowdesk.dto.request.SendMessageRequest;
import com.flowdesk.dto.response.ChatMessageDto;
import com.flowdesk.dto.response.ConversationDto;
import java.util.List;

public interface MessageService {
    List<ConversationDto> listConversations();
    List<ChatMessageDto> getMessages(Integer conversationDisplayId);
    ChatMessageDto sendMessage(Integer conversationDisplayId, SendMessageRequest request);
}
