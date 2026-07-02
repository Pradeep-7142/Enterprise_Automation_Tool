package com.flowdesk.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "messages")
public class Message extends BaseEntity {
    @Column(name = "display_id", unique = true)
    private Integer displayId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "from_side", nullable = false)
    private String fromSide;

    @Column(nullable = false)
    private boolean read = false;

    @Column(name = "sender_label")
    private String senderLabel;
}
