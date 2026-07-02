package com.flowdesk.entity;

import com.flowdesk.constant.Enums;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "workflow_nodes")
public class WorkflowNode extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private WorkflowTemplate template;

    @Column(nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.WorkflowNodeType type;

    @Column(name = "pos_x")
    private double posX;

    @Column(name = "pos_y")
    private double posY;

    @Column(columnDefinition = "TEXT")
    private String config;
}
