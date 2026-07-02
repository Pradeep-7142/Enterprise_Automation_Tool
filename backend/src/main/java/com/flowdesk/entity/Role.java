package com.flowdesk.entity;

import com.flowdesk.constant.Enums;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "roles")
public class Role extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private Enums.SystemRole name;

    @Column(length = 500)
    private String description;
}
