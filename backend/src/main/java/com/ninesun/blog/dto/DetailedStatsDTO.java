package com.ninesun.blog.dto;

import java.util.List;

public record DetailedStatsDTO(
        // 基础统计
        long totalArticles,
        long publishedArticles,
        long draftArticles,
        long totalCategories,
        long totalTags,
        long totalComments,
        long pendingComments,
        long approvedComments,
        long totalUsers,
        long adminCount,
        long totalViews,
        long totalLikes,
        
        // 热门文章
        List<PopularArticleDTO> popularArticles,
        
        // 最近文章
        List<RecentArticleDTO> recentArticles,
        
        // 分类统计
        List<CategoryStatsDTO> categoryStats,
        
        // 标签统计
        List<TagStatsDTO> tagStats
) {
    public static DetailedStatsDTO of(
            long totalArticles,
            long publishedArticles,
            long draftArticles,
            long totalCategories,
            long totalTags,
            long totalComments,
            long pendingComments,
            long approvedComments,
            long totalUsers,
            long adminCount,
            long totalViews,
            long totalLikes,
            List<PopularArticleDTO> popularArticles,
            List<RecentArticleDTO> recentArticles,
            List<CategoryStatsDTO> categoryStats,
            List<TagStatsDTO> tagStats
    ) {
        return new DetailedStatsDTO(
                totalArticles, publishedArticles, draftArticles,
                totalCategories, totalTags,
                totalComments, pendingComments, approvedComments,
                totalUsers, adminCount,
                totalViews, totalLikes,
                popularArticles,
                recentArticles,
                categoryStats,
                tagStats
        );
    }
    
    public record PopularArticleDTO(
            Long id,
            String title,
            String slug,
            long viewCount,
            long likeCount,
            long commentCount
    ) {}
    
    public record RecentArticleDTO(
            Long id,
            String title,
            String slug,
            String status,
            String createdAt
    ) {}
    
    public record CategoryStatsDTO(
            Long id,
            String name,
            String slug,
            long articleCount
    ) {}
    
    public record TagStatsDTO(
            Long id,
            String name,
            String slug,
            long articleCount
    ) {}
}
