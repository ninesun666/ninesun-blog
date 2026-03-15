package com.ninesun.blog.repository;

import com.ninesun.blog.entity.ArticleSocialPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleSocialPostRepository extends JpaRepository<ArticleSocialPost, Long> {
    
    /**
     * 根据文章ID和平台查找同步记录
     */
    Optional<ArticleSocialPost> findByArticleIdAndPlatform(Long articleId, String platform);
    
    /**
     * 根据文章ID查找所有同步记录
     */
    List<ArticleSocialPost> findByArticleId(Long articleId);
    
    /**
     * 根据平台和状态查找记录
     */
    List<ArticleSocialPost> findByPlatformAndPostStatus(String platform, String status);
    
    /**
     * 检查文章是否已同步到指定平台
     */
    boolean existsByArticleIdAndPlatformAndPostStatus(Long articleId, String platform, String status);
}
