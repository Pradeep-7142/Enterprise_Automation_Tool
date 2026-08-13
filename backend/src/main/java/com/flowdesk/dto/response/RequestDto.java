package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestDto {
    private String id;
    private String title;
    private String description;
    private String dept;
    private String priority;
    private String status;
    private String assignee;
    private String step;
    private String created;
    private String updated;
    private String category;
    private List<CommentDto> comments;
    private List<ApprovalStepDto> approvalSteps;
    private List<FileDto> attachments;
}
