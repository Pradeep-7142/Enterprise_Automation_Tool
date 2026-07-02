package com.flowdesk.mapper;

import com.flowdesk.dto.response.ChatMessageDto;
import com.flowdesk.dto.response.ConversationDto;
import com.flowdesk.entity.Conversation;
import com.flowdesk.entity.ConversationParticipant;
import com.flowdesk.entity.Message;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ConversationMapper {
    @Mapping(target = "id", source = "displayId")
    @Mapping(target = "type", expression = "java(c.getType() != null ? c.getType().name() : null)")
    @Mapping(target = "lastMsg", source = "lastMessage")
    @Mapping(target = "time", expression = "java(com.flowdesk.util.DateTimeUtil.shortRelative(c.getUpdatedAt()))")
    @Mapping(target = "unread", ignore = true)
    @Mapping(target = "online", ignore = true)
    @Mapping(target = "members", source = "memberCount")
    ConversationDto toDto(Conversation c);

    @Mapping(target = "id", source = "displayId")
    @Mapping(target = "from", source = "fromSide")
    @Mapping(target = "time", expression = "java(formatMessageTime(m))")
    @Mapping(target = "sender", source = "senderLabel")
    ChatMessageDto toMessageDto(Message m);

    List<ConversationDto> toDtoList(List<Conversation> conversations);
    List<ChatMessageDto> toMessageDtoList(List<Message> messages);

    default String formatMessageTime(Message m) {
        if (m.getCreatedAt() == null) return "";
        var zdt = m.getCreatedAt().atZone(java.time.ZoneOffset.UTC);
        return java.time.format.DateTimeFormatter.ofPattern("h:mm a").format(zdt);
    }

    default ConversationDto toDtoWithParticipant(Conversation c, ConversationParticipant p) {
        ConversationDto dto = toDto(c);
        if (p != null) {
            dto.setUnread(p.getUnreadCount());
            dto.setOnline(p.isOnline());
        } else {
            dto.setUnread(0);
            dto.setOnline(false);
        }
        return dto;
    }
}
