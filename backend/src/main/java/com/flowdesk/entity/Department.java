package com.flowdesk.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "departments")
public class Department extends BaseEntity {
    @Column(name = "display_id", unique = true)
    private Integer displayId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "head_user_id")
    private User head;

    @Column(nullable = false)
    private int members = 0;

    @Column(nullable = false)
    private int requestCount = 0;

    private String budget;

    private int performance = 0;

    @Column(length = 20)
    private String color;
}
