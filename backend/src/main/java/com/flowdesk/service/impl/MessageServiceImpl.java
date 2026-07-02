package com.flowdesk.service.impl;

import com.flowdesk.dto.request.SendMessageRequest;
import com.flowdesk.dto.response.ChatMessageDto;
import com.flowdesk.dto.response.ConversationDto;
import com.flowdesk.entity.*;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.exception.ResourceNotFoundException;
import com.flowdesk.mapper.ConversationMapper;
import com.flowdesk.repository.*;
import com.flowdesk.service.MessageService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class MessageServiceImpl implements MessageService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ConversationParticipantRepository participantRepository;
    private final ConversationMapper conversationMapper;

    public MessageServiceImpl(ConversationRepository conversationRepository, MessageRepository messageRepository,
                              ConversationParticipantRepository participantRepository, ConversationMapper conversationMapper) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.participantRepository = participantRepository;
        this.conversationMapper = conversationMapper;
    }

    @Override
    public List<ConversationDto> listConversations() {
        User user = requireUser();
        return conversationRepository.findByOrganizationIdAndDeletedFalseOrderByUpdatedAtDesc(user.getOrganization().getId())
                .stream().map(c -> {
                    var p = participantRepository.findByConversationIdAndUserIdAndDeletedFalse(c.getId(), user.getId()).orElse(null);
                    return conversationMapper.toDtoWithParticipant(c, p);
                }).toList();
    }

    @Override
    public List<ChatMessageDto> getMessages(Integer conversationDisplayId) {
        Conversation c = conversationRepository.findByDisplayIdAndDeletedFalse(conversationDisplayId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        return conversationMapper.toMessageDtoList(messageRepository.findByConversationIdAndDeletedFalseOrderByCreatedAtAsc(c.getId()));
    }

    @Override
    @Transactional
    public ChatMessageDto sendMessage(Integer conversationDisplayId, SendMessageRequest request) {
        User user = requireUser();
        Conversation c = conversationRepository.findByDisplayIdAndDeletedFalse(conversationDisplayId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        Message msg = new Message();
        msg.setConversation(c);
        msg.setSender(user);
        msg.setText(request.getText());
        msg.setFromSide("me");
        msg.setRead(true);
        c.setLastMessage(request.getText());
        conversationRepository.save(c);
        return conversationMapper.toMessageDto(messageRepository.save(msg));
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
