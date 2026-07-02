package com.flowdesk.entity;

import com.flowdesk.constant.Enums;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "reports")
public class Report extends BaseEntity {
    @Column(name = "display_id", unique = true)
    private Integer displayId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.ReportStatus status;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "schedule_cron")
    private String scheduleCron;

    @Column(name = "last_generated_at")
    private Instant lastGeneratedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;
}
