package com.flowdesk.service.impl;

import com.flowdesk.constant.Enums;
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
    private final UserRepository userRepository;
    private final ConversationMapper conversationMapper;

    public MessageServiceImpl(ConversationRepository conversationRepository, MessageRepository messageRepository,
                              ConversationParticipantRepository participantRepository, UserRepository userRepository,
                              ConversationMapper conversationMapper) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
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
        msg.setSenderLabel(user.getFullName());
        msg.setDisplayId(messageRepository.findMaxDisplayId() + 1);
        c.setLastMessage(request.getText());
        conversationRepository.save(c);
        return conversationMapper.toMessageDto(messageRepository.save(msg));
    }

    @Override
    @Transactional
    public ConversationDto startDirectConversation(Integer targetEmployeeDisplayId) {
        User me = requireUser();
        User target = userRepository.findByDisplayIdAndDeletedFalse(targetEmployeeDisplayId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (target.getId().equals(me.getId())) {
            throw new BusinessException("You cannot start a conversation with yourself", HttpStatus.BAD_REQUEST);
        }

        for (ConversationParticipant p : participantRepository.findByUserIdAndDeletedFalse(me.getId())) {
            Conversation existing = p.getConversation();
            if (existing != null && !existing.isDeleted() && existing.getType() == Enums.ConversationType.direct
                    && participantRepository.findByConversationIdAndUserIdAndDeletedFalse(existing.getId(), target.getId()).isPresent()) {
                return conversationMapper.toDtoWithParticipant(existing, p);
            }
        }

        Conversation c = new Conversation();
        c.setName(target.getFullName());
        c.setType(Enums.ConversationType.direct);
        c.setOrganization(me.getOrganization());
        c.setAvatar(target.getAvatar());
        c.setMemberCount(2);
        c.setDisplayId(conversationRepository.findMaxDisplayId() + 1);
        c.setLastMessage("Conversation started");
        Conversation saved = conversationRepository.save(c);
        ConversationParticipant myParticipant = addParticipant(saved, me);
        addParticipant(saved, target);
        return conversationMapper.toDtoWithParticipant(saved, myParticipant);
    }

    private ConversationParticipant addParticipant(Conversation conversation, User user) {
        ConversationParticipant participant = new ConversationParticipant();
        participant.setConversation(conversation);
        participant.setUser(user);
        participant.setUnreadCount(0);
        participant.setOnline(user.getStatus() == Enums.PresenceStatus.online);
        return participantRepository.save(participant);
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
