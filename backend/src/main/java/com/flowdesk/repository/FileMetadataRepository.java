package com.flowdesk.repository;

import com.flowdesk.entity.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FileMetadataRepository extends JpaRepository<FileMetadata, UUID> {
    List<FileMetadata> findByOrganizationIdAndDeletedFalseOrderByNameAsc(UUID organizationId);
    Optional<FileMetadata> findByDisplayIdAndDeletedFalse(Integer displayId);
    @Query("SELECT f FROM FileMetadata f WHERE f.deleted = false AND f.organization.id = :orgId AND LOWER(f.name) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<FileMetadata> search(UUID orgId, String q);
}
