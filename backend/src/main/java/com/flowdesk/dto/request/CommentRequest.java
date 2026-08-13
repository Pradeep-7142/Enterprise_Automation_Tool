package com.flowdesk.dto.request;

import lombok.Data;

@Data
public class CommentRequest {
    private String content;
    private String text;
    private String parentId;

    public String resolveText() {
        if (text != null && !text.isBlank()) return text;
        return content != null ? content : "";
    }
}
