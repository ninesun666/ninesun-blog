package com.ninesun.blog.repository;

import com.ninesun.blog.entity.SocialAccountToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SocialAccountTokenRepository extends JpaRepository<SocialAccountToken, Long> {
    
    /**
     * 根据用户ID和平台查找Token
     */
    Optional<SocialAccountToken> findByUserIdAndPlatform(Long userId, String platform);
    
    /**
     * 根据平台和活跃状态查找所有Token
     */
    java.util.List<SocialAccountToken> findByPlatformAndIsActiveTrue(String platform);
    
    /**
     * 删除用户在指定平台的Token
     */
    void deleteByUserIdAndPlatform(Long userId, String platform);
    
    /**
     * 检查用户是否已绑定指定平台
     */
    boolean existsByUserIdAndPlatformAndIsActiveTrue(Long userId, String platform);
}
