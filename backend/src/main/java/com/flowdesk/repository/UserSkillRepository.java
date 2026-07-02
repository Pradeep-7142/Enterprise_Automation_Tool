package com.flowdesk.repository;

import com.flowdesk.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface UserSkillRepository extends JpaRepository<UserSkill, UUID> {
    List<UserSkill> findByUserIdAndDeletedFalse(UUID userId);
}
