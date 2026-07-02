package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private Integer id;
    private String name;
    private String type;
    private String lastMsg;
    private String time;
    private Integer unread;
    private Boolean online;
    private String avatar;
    private Integer members;
}
