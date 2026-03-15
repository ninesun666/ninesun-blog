package com.ninesun.blog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 文章同步到社交平台的记录
 */
@Entity
@Table(name = "article_social_posts", indexes = {
    @Index(name = "idx_article_social_posts_article", columnList = "articleId"),
    @Index(name = "idx_article_social_posts_platform", columnList = "platform")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_article_platform", columnNames = {"articleId", "platform"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleSocialPost {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "article_id", nullable = false)
    private Long articleId;
    
    @Column(name = "platform", nullable = false, length = 20)
    private String platform;
    
    @Column(name = "platform_post_id", length = 100)
    private String platformPostId; // 推文 ID
    
    @Column(name = "post_url", length = 500)
    private String postUrl;
    
    @Column(name = "post_content", columnDefinition = "TEXT")
    private String postContent;
    
    @Column(name = "post_status", nullable = false, length = 20)
    private String postStatus; // SUCCESS, FAILED, PENDING
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "posted_at")
    private LocalDateTime postedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    /**
     * 状态枚举
     */
    public static final String STATUS_SUCCESS = "SUCCESS";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_PENDING = "PENDING";
}
