package com.ninesun.blog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 第三方社交平台 OAuth Token 存储实体
 */
@Entity
@Table(name = "social_account_tokens", indexes = {
    @Index(name = "idx_social_tokens_platform", columnList = "platform"),
    @Index(name = "idx_social_tokens_active", columnList = "isActive")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialAccountToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "platform", nullable = false, length = 20)
    private String platform; // TWITTER, WEIBO, etc.
    
    @Column(name = "platform_user_id", length = 100)
    private String platformUserId;
    
    @Column(name = "platform_username", length = 100)
    private String platformUsername;
    
    @Column(name = "access_token", nullable = false, columnDefinition = "TEXT")
    private String accessToken; // AES-256 加密存储
    
    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken; // AES-256 加密存储
    
    @Column(name = "token_type", length = 20)
    @Builder.Default
    private String tokenType = "Bearer";
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * 平台枚举
     */
    public static final String TWITTER = "TWITTER";
    public static final String WEIBO = "WEIBO";
}
