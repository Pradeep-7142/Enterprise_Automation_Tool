package com.flowdesk.entity;

import com.flowdesk.constant.Enums;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "file_metadata")
public class FileMetadata extends BaseEntity {
    @Column(name = "display_id", unique = true)
    private Integer displayId;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.FileType type;

    @Column(name = "size_label")
    private String sizeLabel;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "storage_key")
    private String storageKey;

    @Column(name = "content_type")
    private String contentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private FileMetadata parent;

    @Column(name = "item_count")
    private Integer itemCount;

    @Column(nullable = false)
    private boolean shared = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
}
