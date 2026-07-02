package com.flowdesk.repository;

import com.flowdesk.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    Optional<Organization> findBySlugAndDeletedFalse(String slug);
    Optional<Organization> findByNameAndDeletedFalse(String name);
    boolean existsBySlugAndDeletedFalse(String slug);
    Optional<Organization> findByRazorpaySubscriptionId(String razorpaySubscriptionId);
}

