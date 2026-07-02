package com.flowdesk.repository;

import com.flowdesk.constant.Enums;
import com.flowdesk.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByNameAndDeletedFalse(Enums.SystemRole name);
}
