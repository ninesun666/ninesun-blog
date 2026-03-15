package com.ninesun.blog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 站点设置实体
 * 使用单行存储模式，id 固定为 1
 */
@Entity
@Table(name = "site_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteSettings {
    
    @Id
    @Column(name = "id")
    private Long id;
    
    @Column(name = "site_name")
    private String siteName;
    
    @Column(name = "site_description", columnDefinition = "TEXT")
    private String siteDescription;
    
    @Column(name = "site_keywords")
    private String siteKeywords;
    
    @Column(name = "footer_text")
    private String footerText;
    
    @Column(name = "social_github")
    private String socialGithub;
    
    @Column(name = "social_twitter")
    private String socialTwitter;
    
    @Column(name = "social_email")
    private String socialEmail;
    
    @Column(name = "allow_guest_comment")
    private Boolean allowGuestComment;
    
    @Column(name = "require_comment_approval")
    private Boolean requireCommentApproval;
    
    @Column(name = "auto_sync_to_twitter")
    private Boolean autoSyncToTwitter;
    
    @Column(name = "twitter_sync_format", columnDefinition = "TEXT")
    private String twitterSyncFormat;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * 默认设置
     */
    public static SiteSettings defaultSettings() {
        return SiteSettings.builder()
                .id(1L)
                .siteName("NineSun Blog")
                .siteDescription("技术博客，分享编程与生活")
                .siteKeywords("技术,编程,博客")
                .footerText("© 2026 NineSun Blog. All rights reserved.")
                .socialGithub("")
                .socialTwitter("")
                .socialEmail("")
                .allowGuestComment(true)
                .requireCommentApproval(true)
                .autoSyncToTwitter(false)
                .twitterSyncFormat("📝 新文章: {title}\n{url}")
                .build();
    }
}
